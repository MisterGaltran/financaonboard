import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SYMBOLS = ['PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'ABEV3'];

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      symbols: DEFAULT_SYMBOLS,
      add: (symbol) => {
        const s = String(symbol || '').toUpperCase().trim();
        if (!s) return;
        const cur = get().symbols;
        if (cur.includes(s)) return;
        set({ symbols: [...cur, s] });
      },
      remove: (symbol) => set({ symbols: get().symbols.filter((x) => x !== symbol) }),
      clear: () => set({ symbols: [] }),
      reset: () => set({ symbols: DEFAULT_SYMBOLS })
    }),
    { name: 'financaonboard:watchlist', version: 1 }
  )
);
