import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  events: [],
  lastUpdate: null,
  setEvents: (events) => set({ events, lastUpdate: Date.now() })
}));
