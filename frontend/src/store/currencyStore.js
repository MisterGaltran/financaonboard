import { create } from 'zustand';

export const useCurrencyStore = create((set) => ({
  quotes: [],
  lastUpdate: null,
  setQuotes: (quotes) => set({ quotes, lastUpdate: Date.now() }),
}));
