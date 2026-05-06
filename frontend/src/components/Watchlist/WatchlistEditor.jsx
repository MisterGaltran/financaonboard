import { useMemo, useRef, useState, useEffect } from 'react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import { useCurrencyStore } from '../../store/currencyStore';

const CURRENCY_CATALOG = [
  { symbol: 'USDBRL', name: 'Dólar Americano', assetType: 'currency' },
  { symbol: 'EURBRL', name: 'Euro', assetType: 'currency' },
  { symbol: 'GBPBRL', name: 'Libra Esterlina', assetType: 'currency' },
  { symbol: 'JPYBRL', name: 'Iene Japonês', assetType: 'currency' },
  { symbol: 'CNYBRL', name: 'Yuan Chinês', assetType: 'currency' },
  { symbol: 'ARSBRL', name: 'Peso Argentino', assetType: 'currency' },
  { symbol: 'CHFBRL', name: 'Franco Suíço', assetType: 'currency' },
  { symbol: 'CADBRL', name: 'Dólar Canadense', assetType: 'currency' },
  { symbol: 'AUDBRL', name: 'Dólar Australiano', assetType: 'currency' },
  { symbol: 'BTCBRL', name: 'Bitcoin', assetType: 'crypto' },
  { symbol: 'ETHBRL', name: 'Ethereum', assetType: 'crypto' },
  { symbol: 'XRPBRL', name: 'Ripple (XRP)', assetType: 'crypto' },
  { symbol: 'DOGEBRL', name: 'Dogecoin', assetType: 'crypto' },
  { symbol: 'LTCBRL', name: 'Litecoin', assetType: 'crypto' },
];

function formatPrice(price) {
  if (price == null || isNaN(price)) return '—';
  try {
    const digits = price > 1000 ? 0 : price < 1 ? 4 : 2;
    return 'R$ ' + Number(price).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  } catch {
    return 'R$ ' + price;
  }
}

export default function WatchlistEditor({ onClose }) {
  const symbols = useWatchlistStore((s) => s.symbols);
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const clear = useWatchlistStore((s) => s.clear);
  const reset = useWatchlistStore((s) => s.reset);
  const ibov = useBrQuotesStore((s) => s.quotes);
  const currencyQuotes = useCurrencyStore((s) => s.quotes);

  const [tab, setTab] = useState('stocks');
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setQuery('');
  };

  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();

    if (tab === 'stocks') {
      const list = Array.isArray(ibov) ? ibov : [];
      if (!q) return list.slice(0, 12);
      return list
        .filter((s) => (s.symbol || '').includes(q) || (s.name || '').toUpperCase().includes(q))
        .slice(0, 20);
    }

    // currency & crypto tab
    const liveMap = new Map();
    if (Array.isArray(currencyQuotes)) {
      for (const cq of currencyQuotes) liveMap.set(cq.symbol, cq);
    }

    const items = CURRENCY_CATALOG.map((c) => {
      const live = liveMap.get(c.symbol);
      return {
        symbol: c.symbol,
        name: c.name,
        assetType: c.assetType,
        price: live ? live.price : null,
        changePct: live ? live.changePct : null,
      };
    });

    if (!q) return items;
    return items.filter((c) =>
      c.symbol.includes(q) || (c.name || '').toUpperCase().includes(q)
    );
  }, [ibov, currencyQuotes, query, tab]);

  const handleAdd = (symbol) => {
    add(symbol);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[8000] flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface-alt border-2 border-accent rounded shadow-[0_0_40px_rgba(99,102,241,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border rounded-t">
          <span className="text-ui-sm font-semibold tracking-widest text-text-primary">EDITAR WATCHLIST</span>
          <button onClick={onClose} className="text-ui-xs text-text-secondary hover:text-negative tracking-widest">FECHAR · ESC</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('stocks')}
              className={`px-3 py-1.5 text-ui-xs tracking-widest rounded border ${tab === 'stocks' ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
            >
              AÇÕES
            </button>
            <button
              onClick={() => handleTabChange('currency')}
              className={`px-3 py-1.5 text-ui-xs tracking-widest rounded border ${tab === 'currency' ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
            >
              CÂMBIO & CRYPTO
            </button>
          </div>

          {/* Search */}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && suggestions.length > 0) {
                handleAdd(suggestions[0].symbol);
              }
              if (e.key === 'Escape') onClose();
            }}
            placeholder={tab === 'stocks' ? 'Buscar PETR4, Vale, banco...' : 'Buscar USD, Bitcoin, EUR...'}
            className="w-full px-3 py-2 bg-surface border border-border focus:border-accent rounded outline-none text-text-primary placeholder-text-secondary tabular-nums tracking-wider text-ui-sm"
          />

          {/* Results */}
          <div>
            <div className="text-ui-xs tracking-widest text-text-secondary mb-1.5">
              {query.trim()
                ? `RESULTADOS (${suggestions.length})`
                : tab === 'stocks' ? 'TOP-12 IBOV POR VOLUME' : 'MOEDAS & CRIPTOMOEDAS'}
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded">
              {suggestions.length === 0 && (
                <div className="px-3 py-4 text-ui-xs text-text-secondary text-center">Nenhum resultado</div>
              )}
              {suggestions.map((s) => {
                const already = symbols.includes(s.symbol);
                const isCrypto = s.assetType === 'crypto';
                const isCurrency = s.assetType === 'currency';
                return (
                  <button
                    key={s.symbol}
                    onClick={() => (already ? remove(s.symbol) : handleAdd(s.symbol))}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 border-b border-border/50 hover:bg-surface-hover text-ui-xs ${already ? 'bg-surface-hover' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] font-bold ${already ? 'bg-accent border-accent text-white' : 'border-text-secondary text-text-secondary'}`}>
                        {already ? '✓' : '+'}
                      </span>
                      <span className="font-semibold tracking-wider text-text-primary">{s.symbol}</span>
                      <span className="text-text-secondary truncate max-w-[180px]">{s.name || ''}</span>
                      {isCrypto && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded tracking-wider bg-warning/20 text-warning">CRYPTO</span>
                      )}
                      {isCurrency && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded tracking-wider bg-info/20 text-info">FX</span>
                      )}
                    </span>
                    <span className="tabular-nums text-text-secondary">
                      {formatPrice(s.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current list */}
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
