import { create } from 'zustand';

export const useBrQuotesStore = create((set) => ({
  quotes: [],
  lastUpdate: null,
  error: null,
  setQuotes: (quotes) => set({ quotes, lastUpdate: Date.now(), error: null }),
  setError: (error) => set({ error })
}));
