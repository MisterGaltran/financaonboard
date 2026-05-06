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
      <div className="w-full max-w-2xl bg-surface-alt border-2 border-accent rounded shadow-[0_0_40px_rgba(99,102,241,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border rounded-t">
          <span className="text-ui-sm font-semibold tracking-widest text-text-primary">EDIT WATCHLIST</span>
          <button onClick={onClose} className="text-ui-xs text-text-secondary hover:text-negative tracking-widest">CLOSE · ESC</button>
        </div>

        <div className="p-4 space-y-4">
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
              placeholder="Buscar PETR4, Vale, banco..."
              className="w-full px-3 py-2 bg-surface border border-border focus:border-accent rounded outline-none text-text-primary placeholder-text-secondary tabular-nums tracking-wider text-ui-sm"
            />
          </div>

          <div>
            <div className="text-ui-xs tracking-widest text-text-secondary mb-1.5">
              {query.trim() ? `RESULTADOS (${suggestions.length})` : 'TOP-12 IBOV POR VOLUME'}
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded">
              {suggestions.length === 0 && (
                <div className="px-3 py-4 text-ui-xs text-text-secondary text-center">Nenhum resultado</div>
              )}
              {suggestions.map((s) => {
                const already = symbols.includes(s.symbol);
                return (
                  <button
                    key={s.symbol}
                    onClick={() => (already ? remove(s.symbol) : add(s.symbol))}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 border-b border-border/50 hover:bg-surface-hover text-ui-xs ${already ? 'bg-surface-hover' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] font-bold ${already ? 'bg-accent border-accent text-white' : 'border-text-secondary text-text-secondary'}`}>
                        {already ? '✓' : '+'}
                      </span>
                      <span className="font-semibold tracking-wider text-text-primary">{s.symbol}</span>
                      <span className="text-text-secondary truncate max-w-[200px]">{s.name}</span>
                    </span>
                    <span className="tabular-nums text-text-secondary">R$ {s.price?.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ui-xs tracking-widest text-text-secondary">SUA LISTA ({symbols.length})</span>
              <div className="flex gap-2 text-ui-xs tracking-widest">
                <button onClick={reset} className="text-text-secondary hover:text-accent">RESET</button>
                <button onClick={clear} className="text-text-secondary hover:text-negative">LIMPAR</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {symbols.length === 0 && (
                <span className="text-ui-xs text-text-secondary italic">Watchlist vazia</span>
              )}
              {symbols.map((s) => (
                <button
                  key={s}
                  onClick={() => remove(s)}
                  className="px-2 py-0.5 text-ui-xs rounded bg-accent/10 border border-accent/40 text-accent hover:border-negative hover:text-negative hover:bg-negative/10 tracking-wider"
                  title="Clique para remover"
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
