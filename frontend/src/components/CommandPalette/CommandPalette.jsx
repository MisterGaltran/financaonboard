import { useEffect, useMemo, useRef, useState } from 'react';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import { useNewsStore } from '../../store/newsStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useWatchlistStore } from '../../store/watchlistStore';
import { fmtHHMM } from '../../utils/formatters';
import { flagFor } from '../../utils/countries';

const MAX_PER_GROUP = 6;

export default function CommandPalette({ open, onClose }) {
  const quotes = useBrQuotesStore((s) => s.quotes);
  const news = useNewsStore((s) => s.items);
  const events = useCalendarStore((s) => s.events);
  const watchlist = useWatchlistStore((s) => s.symbols);
  const addSymbol = useWatchlistStore((s) => s.add);
  const removeSymbol = useWatchlistStore((s) => s.remove);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { group: 'WATCHLIST', items: watchlist.slice(0, 6).map((s) => ({ type: 'ticker', symbol: s, inWatchlist: true })) },
        { group: 'TRENDING', items: quotes.slice(0, 6).map((s) => ({ type: 'ticker', symbol: s.symbol, name: s.name, price: s.price, changePct: s.changePct, inWatchlist: watchlist.includes(s.symbol) })) }
      ].filter((g) => g.items.length > 0);
    }

    const tickers = quotes
      .filter((s) => s.symbol.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q))
      .slice(0, MAX_PER_GROUP)
      .map((s) => ({ type: 'ticker', symbol: s.symbol, name: s.name, price: s.price, changePct: s.changePct, inWatchlist: watchlist.includes(s.symbol) }));

    const newsItems = news
      .filter((n) => (n.headline || '').toLowerCase().includes(q) || (n.source || '').toLowerCase().includes(q))
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, MAX_PER_GROUP)
      .map((n) => ({ type: 'news', id: n.id, headline: n.headline, source: n.source, url: n.url, datetime: n.datetime, impact: n.impact, language: n.language }));

    const eventItems = events
      .filter((e) => (e.event || '').toLowerCase().includes(q) || (e.country || '').toLowerCase().includes(q))
      .slice(0, MAX_PER_GROUP)
      .map((e) => ({ type: 'event', id: e.id, event: e.event, country: e.country, time: e.time, impact: e.impact }));

    return [
      { group: 'TICKERS', items: tickers },
      { group: 'NEWS',    items: newsItems },
      { group: 'EVENTS',  items: eventItems }
    ].filter((g) => g.items.length > 0);
  }, [query, quotes, news, events, watchlist]);

  const flatList = useMemo(() => results.flatMap((g) => g.items), [results]);

  useEffect(() => { setActive(0); }, [query]);

  const activate = (item) => {
    if (!item) return;
    if (item.type === 'ticker') {
      if (item.inWatchlist) removeSymbol(item.symbol);
      else addSymbol(item.symbol);
    } else if (item.type === 'news' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.type === 'event') {
      const el = document.querySelector(`[data-event-id="${item.id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flatList.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); activate(flatList[active]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatList, active, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[8500] flex items-start justify-center pt-24 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-bbg-panel border-2 border-bbg-amber shadow-[0_0_40px_rgba(255,184,0,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 py-2 bg-black border-b border-bbg-border">
          <span className="text-bbg-amber text-bbg-sm font-bold tracking-widest">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="buscar ticker · manchete · evento · país..."
            className="flex-1 bg-transparent border-0 outline-none text-bbg-amber placeholder-bbg-muted tabular-nums tracking-wider text-bbg-sm"
          />
          <span className="text-[10px] text-bbg-muted tracking-widest">ESC</span>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="px-3 py-6 text-bbg-xs text-bbg-muted text-center tracking-wider">
              NO RESULTS · try a ticker, keyword, country code...
            </div>
          )}
          {results.map((group) => (
            <div key={group.group}>
              <div className="sticky top-0 bg-black/95 border-b border-bbg-border px-3 py-0.5 text-[10px] text-bbg-muted tracking-widest">
                {group.group}
              </div>
              {group.items.map((item) => {
                flatIdx += 1;
                const idx = flatIdx;
                const isActive = idx === active;
                return (
                  <button
                    key={`${item.type}-${item.id || item.symbol}-${idx}`}
                    data-idx={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => activate(item)}
                    className={`w-full text-left px-3 py-1.5 border-b border-bbg-border/40 flex items-center gap-2 ${isActive ? 'bg-bbg-amber/15 text-bbg-amber' : 'text-bbg-amber-dim hover:bg-bbg-panel-alt'}`}
                  >
                    {renderItem(item)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 px-3 py-1 bg-black border-t border-bbg-border text-[9px] text-bbg-muted tracking-widest">
          <div className="flex gap-3">
            <span>↑↓ NAV</span>
            <span>↵ ACTIVATE</span>
            <span>ESC CLOSE</span>
          </div>
          <div className="flex gap-3">
            <span>TICKER · TOGGLE WATCH</span>
            <span>NEWS · OPEN ↗</span>
            <span>EVENT · SCROLL TO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderItem(item) {
  if (item.type === 'ticker') {
    const up = item.changePct != null && item.changePct > 0;
    const down = item.changePct != null && item.changePct < 0;
    const col = up ? 'text-bbg-green' : down ? 'text-bbg-red' : 'text-bbg-amber-dim';
    return (
      <>
        <span className="w-5 text-[9px] text-bbg-muted">{item.inWatchlist ? '★' : '+'}</span>
        <span className="w-16 font-bold tracking-wider text-bbg-amber">{item.symbol}</span>
        <span className="flex-1 truncate text-bbg-muted">{item.name || ''}</span>
        {item.price != null && <span className={`text-bbg-xs tabular-nums ${col}`}>R$ {item.price?.toFixed(2)}</span>}
        {item.changePct != null && <span className={`text-bbg-xs tabular-nums font-bold w-16 text-right ${col}`}>
          {up ? '▲' : down ? '▼' : '·'}{Math.abs(item.changePct).toFixed(2)}%
        </span>}
      </>
    );
  }
  if (item.type === 'news') {
    const impact = item.impact === 'high' ? 'text-bbg-red font-bold' : 'text-bbg-muted';
    return (
      <>
        <span className={`w-5 text-[9px] text-center ${impact}`}>{item.impact === 'high' ? '⚠' : '·'}</span>
        <span className="w-14 text-bbg-xs tabular-nums text-bbg-cyan">{fmtHHMM(item.datetime)}</span>
        <span className="w-20 truncate text-[10px] uppercase text-bbg-amber-dim">{item.source}</span>
        {item.language === 'pt' && <span>🇧🇷</span>}
        <span className="flex-1 truncate text-bbg-amber">{item.headline}</span>
      </>
    );
  }
  if (item.type === 'event') {
    const impact = item.impact === 'high' ? 'bg-bbg-red text-black' : item.impact === 'medium' ? 'bg-bbg-yellow text-black' : 'bg-bbg-muted/40 text-bbg-amber';
    return (
      <>
        <span className={`w-5 h-5 inline-flex items-center justify-center text-[10px] font-black ${impact}`}>
          {item.impact === 'high' ? 'H' : item.impact === 'medium' ? 'M' : 'L'}
        </span>
        <span className="text-bbg-xs tabular-nums text-bbg-cyan">{String(item.time).slice(11, 16) || String(item.time).slice(5, 10)}</span>
        <span className="w-10 text-bbg-muted">{flagFor(item.country)} {item.country}</span>
        <span className="flex-1 truncate text-bbg-amber">{item.event}</span>
      </>
    );
  }
  return null;
}
