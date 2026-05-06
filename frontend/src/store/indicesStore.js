import { create } from 'zustand';

export const useIndicesStore = create((set) => ({
  ibov: null,
  sp500: null,
  btc: null,
  setIndices: ({ ibov, sp500, btc }) => set({ ibov, sp500, btc }),
}));
