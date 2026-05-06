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
        { group: 'TRENDING', items: quotes.slice(0, 6).map((s) => ({ type: 'ticker', symbol: s.symbol, name: s.name, price: s.price, changePct: s.changePct, inWatchlist: watchlist.includes(s.symbol) })) },
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
      { group: 'NEWS', items: newsItems },
      { group: 'EVENTS', items: eventItems },
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
      <div className="w-full max-w-2xl bg-surface-alt border-2 border-accent rounded shadow-[0_0_40px_rgba(99,102,241,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border rounded-t">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ticker, manchete, evento, pais..."
            className="flex-1 bg-transparent border-0 outline-none text-text-primary placeholder-text-secondary tabular-nums tracking-wider text-ui-sm"
          />
          <span className="text-[10px] text-text-secondary tracking-widest border border-border rounded px-1.5 py-0.5">ESC</span>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="px-4 py-8 text-ui-sm text-text-secondary text-center tracking-wider">
              Nenhum resultado
            </div>
          )}
          {results.map((group) => (
            <div key={group.group}>
              <div className="sticky top-0 bg-surface/95 border-b border-border px-4 py-1 text-ui-xs text-text-secondary tracking-widest">
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
                    className={`w-full text-left px-4 py-2 border-b border-border/40 flex items-center gap-2 ${isActive ? 'bg-accent/15 text-text-primary' : 'text-text-secondary hover:bg-surface-hover'}`}
                  >
                    {renderItem(item)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-surface border-t border-border rounded-b text-[10px] text-text-secondary tracking-widest">
          <div className="flex gap-3">
            <span>↑↓ NAV</span>
            <span>↵ ATIVAR</span>
            <span>ESC FECHAR</span>
          </div>
          <div className="flex gap-3">
            <span>TICKER · WATCHLIST</span>
            <span>NEWS · ABRIR ↗</span>
            <span>EVENTO · IR</span>
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
    const col = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
    return (
      <>
        <span className="w-5 text-[10px] text-text-secondary">{item.inWatchlist ? '★' : '+'}</span>
        <span className="w-16 font-semibold tracking-wider text-text-primary">{item.symbol}</span>
        <span className="flex-1 truncate text-text-secondary">{item.name || ''}</span>
        {item.price != null && <span className={`text-ui-xs tabular-nums ${col}`}>R$ {item.price?.toFixed(2)}</span>}
        {item.changePct != null && (
          <span className={`text-ui-xs tabular-nums font-semibold w-16 text-right ${col}`}>
            {up ? '▲' : down ? '▼' : ''} {Math.abs(item.changePct).toFixed(2)}%
          </span>
        )}
      </>
    );
  }
  if (item.type === 'news') {
    const impact = item.impact === 'high' ? 'text-negative font-bold' : 'text-text-secondary';
    return (
      <>
        <span className={`w-5 text-[10px] text-center ${impact}`}>{item.impact === 'high' ? '!' : '·'}</span>
        <span className="w-14 text-ui-xs tabular-nums text-info">{fmtHHMM(item.datetime)}</span>
        <span className="w-20 truncate text-ui-xs uppercase text-text-secondary">{item.source}</span>
        {item.language === 'pt' && <span className="text-ui-xs text-text-secondary">BR</span>}
        <span className="flex-1 truncate text-text-primary">{item.headline}</span>
      </>
    );
  }
  if (item.type === 'event') {
    const impact = item.impact === 'high' ? 'bg-negative text-white' : item.impact === 'medium' ? 'bg-warning text-black' : 'bg-text-secondary/30 text-text-primary';
    return (
      <>
        <span className={`w-5 h-5 inline-flex items-center justify-center text-[10px] font-bold rounded ${impact}`}>
          {item.impact === 'high' ? 'H' : item.impact === 'medium' ? 'M' : 'L'}
        </span>
        <span className="text-ui-xs tabular-nums text-info">{String(item.time).slice(11, 16) || String(item.time).slice(5, 10)}</span>
        <span className="w-10 text-text-secondary">{flagFor(item.country)} {item.country}</span>
        <span className="flex-1 truncate text-text-primary">{item.event}</span>
      </>
    );
  }
  return null;
}
