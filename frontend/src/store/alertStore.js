import { create } from 'zustand';

export const useAlertStore = create((set, get) => ({
  queue: [],
  soundEnabled: false,
  enqueue: (alert) => {
    const q = get().queue;
    if (q.some((a) => a.id === alert.id)) return;
    set({ queue: [...q, alert] });
  },
  acknowledge: (id) => set({ queue: get().queue.filter((a) => a.id !== id) }),
  clearAll: () => set({ queue: [] }),
  enableSound: () => set({ soundEnabled: true })
}));
