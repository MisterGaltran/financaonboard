import { create } from 'zustand';

const MAX_ITEMS = 300;

export const useNewsStore = create((set, get) => ({
  items: [],
  setInitial: (items) => set({ items: items.slice(0, MAX_ITEMS) }),
  addItem: (item) => {
    const existing = get().items;
    if (existing.some((n) => n.id === item.id)) return;
    const next = [item, ...existing].slice(0, MAX_ITEMS);
    set({ items: next });
  },
  clear: () => set({ items: [] })
}));
