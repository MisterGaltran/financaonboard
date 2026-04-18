import { useMemo, useRef, useState, useEffect } from 'react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useBrQuotesStore } from '../../store/brQuotesStore';

export default function WatchlistEditor({ onClose }) {
  const symbols = useWatchlistStore((s) => s.symbols);
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const clear = useWatchlistStore((s) => s.clear);
  const reset = useWatchlistStore((s) => s.reset);
  const ibov = useBrQuotesStore((s) => s.quotes);

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return ibov.slice(0, 12);
    return ibov
      .filter((s) => s.symbol.includes(q) || (s.name || '').toUpperCase().includes(q))
      .slice(0, 20);
  }, [ibov, query]);

  return (
    <div className="fixed inset-0 z-[8000] flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-bbg-panel border-2 border-bbg-amber" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-3 py-2 bg-black border-b border-bbg-border">
          <span className="text-bbg-xs font-bold tracking-widest text-bbg-amber">EDIT WATCHLIST</span>
          <button onClick={onClose} className="text-bbg-xs text-bbg-muted hover:text-bbg-red tracking-widest">CLOSE · ESC</button>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions[0]) {
                  add(suggestions[0].symbol);
                  setQuery('');
                }
                if (e.key === 'Escape') onClose();
              }}
              placeholder="buscar PETR4, Vale, banco..."
              className="w-full px-3 py-2 bg-black border border-bbg-border focus:border-bbg-amber outline-none text-bbg-amber tabular-nums tracking-wider text-bbg-sm"
            />
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-bbg-muted mb-1">
              {query.trim() ? `SEARCH RESULTS (${suggestions.length})` : 'TOP-12 IBOV BY VOLUME'}
            </div>
            <div className="max-h-48 overflow-y-auto border border-bbg-border">
              {suggestions.length === 0 && (
                <div className="px-3 py-4 text-bbg-xs text-bbg-muted text-center">NO MATCH · try: PETR, VALE, ITUB...</div>
              )}
              {suggestions.map((s) => {
                const already = symbols.includes(s.symbol);
                return (
                  <button
                    key={s.symbol}
                    onClick={() => (already ? remove(s.symbol) : add(s.symbol))}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 border-b border-bbg-border/50 hover:bg-bbg-panel-alt text-bbg-xs ${already ? 'bg-bbg-panel-alt' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3 h-3 border ${already ? 'bg-bbg-amber border-bbg-amber text-black' : 'border-bbg-muted'} text-[8px] font-black leading-none flex items-center justify-center`}>
                        {already ? '✓' : '+'}
                      </span>
                      <span className="font-bold tracking-wider text-bbg-amber">{s.symbol}</span>
                      <span className="text-bbg-muted truncate max-w-[200px]">{s.name}</span>
                    </span>
                    <span className="tabular-nums text-bbg-muted">R$ {s.price?.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] tracking-widest text-bbg-muted">YOUR LIST ({symbols.length})</span>
              <div className="flex gap-2 text-[10px] tracking-widest">
                <button onClick={reset} className="text-bbg-muted hover:text-bbg-amber">RESET</button>
                <button onClick={clear} className="text-bbg-muted hover:text-bbg-red">CLEAR ALL</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {symbols.length === 0 && (
                <span className="text-bbg-xs text-bbg-muted italic">watchlist vazia</span>
              )}
              {symbols.map((s) => (
                <button
                  key={s}
                  onClick={() => remove(s)}
                  className="px-2 py-0.5 text-bbg-xs bg-bbg-amber/10 border border-bbg-amber/40 text-bbg-amber hover:border-bbg-red hover:text-bbg-red hover:bg-bbg-red/10 tracking-wider"
                  title="clique para remover"
                >
                  {s} ✕
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
