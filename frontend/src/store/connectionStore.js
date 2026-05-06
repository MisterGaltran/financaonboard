import { create } from 'zustand';

export const useConnectionStore = create((set) => ({
  status: 'disconnected',
  attempts: 0,
  providers: { finnhub: 'unknown', eodhd: 'unknown' },
  setStatus: (status) => set({ status }),
  incAttempts: () => set((s) => ({ attempts: s.attempts + 1 })),
  resetAttempts: () => set({ attempts: 0 }),
  setProviders: (providers) => set({ providers: { ...providers } })
}));
