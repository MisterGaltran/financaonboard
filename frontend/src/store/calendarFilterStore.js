import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCalendarFilterStore = create(
  persist(
    (set, get) => ({
      selected: [],
      hideLowImpact: false,
      next24h: false,
      hidePast: false,
      toggle: (country) => {
        const cur = get().selected;
        set({ selected: cur.includes(country) ? cur.filter((c) => c !== country) : [...cur, country] });
      },
      setAll: (countries) => set({ selected: countries }),
      clear: () => set({ selected: [] }),
      toggleHideLow: () => set({ hideLowImpact: !get().hideLowImpact }),
      toggleNext24h: () => set({ next24h: !get().next24h }),
      toggleHidePast: () => set({ hidePast: !get().hidePast })
    }),
    {
      name: 'financaonboard:calendar-filter',
      version: 2
    }
  )
);
