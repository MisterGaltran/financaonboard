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
    <div className="bg-surface-alt border-b border-border">
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-b border-border">
        <span className="text-ui-xs font-semibold tracking-widest text-text-primary">WATCHLIST</span>
        <div className="flex items-center gap-2">
          <span className="text-ui-xs text-text-secondary tabular-nums tracking-wider">{symbols.length} SYMBOLS</span>
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-0.5 text-ui-xs tracking-widest rounded border border-border text-text-secondary hover:border-accent hover:text-accent"
          >
            + EDIT
          </button>
        </div>
      </div>

      {symbols.length === 0 ? (
        <div className="px-4 py-4 text-ui-sm text-text-secondary text-center tracking-wider">
          Watchlist vazia &middot;{' '}
          <button onClick={() => setEditing(true)} className="text-accent hover:text-accent-light">
            + Adicionar tickers
          </button>
        </div>
      ) : (
        <div className="grid gap-px bg-border" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {symbols.map((s) => (
            <WatchlistTile key={s} symbol={s} quote={quoteMap.get(s)} onRemove={remove} />
          ))}
        </div>
      )}

      {editing && <WatchlistEditor onClose={() => setEditing(false)} />}
    </div>
  );
}
