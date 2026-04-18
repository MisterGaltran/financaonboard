import { useEffect, useMemo, useState } from 'react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import WatchlistTile from './WatchlistTile';
import WatchlistEditor from './WatchlistEditor';

export default function Watchlist() {
  const symbols = useWatchlistStore((s) => s.symbols);
  const remove = useWatchlistStore((s) => s.remove);
  const quotes = useBrQuotesStore((s) => s.quotes);
  const [editing, setEditing] = useState(false);

  const quoteMap = useMemo(() => {
    const m = new Map();
    for (const q of quotes) m.set(q.symbol, q);
    return m;
  }, [quotes]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && editing) setEditing(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing]);

  return (
    <div className="bg-bbg-panel border-b border-bbg-border">
      <div className="flex items-center justify-between px-3 py-1 bg-black border-b border-bbg-border">
        <span className="text-bbg-xs font-bold tracking-widest text-bbg-yellow">MY WATCHLIST</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-bbg-muted tabular-nums tracking-wider">{symbols.length} SYMBOLS</span>
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-0.5 text-[10px] tracking-widest border border-bbg-border text-bbg-muted hover:border-bbg-amber hover:text-bbg-amber"
          >
            + EDIT
          </button>
        </div>
      </div>

      {symbols.length === 0 ? (
        <div className="px-3 py-3 text-bbg-xs text-bbg-muted text-center tracking-wider">
          EMPTY WATCHLIST · CLICK <button onClick={() => setEditing(true)} className="text-bbg-amber hover:text-bbg-yellow mx-1">+ EDIT</button> TO ADD TICKERS
        </div>
      ) : (
        <div className="grid gap-px bg-bbg-border" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
          {symbols.map((s) => (
            <WatchlistTile key={s} symbol={s} quote={quoteMap.get(s)} onRemove={remove} />
          ))}
        </div>
      )}

      {editing && <WatchlistEditor onClose={() => setEditing(false)} />}
    </div>
  );
}
