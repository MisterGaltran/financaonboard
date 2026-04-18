import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNewsFilterStore = create(
  persist(
    (set, get) => ({
      sources: [],
      languages: [],
      hideLowImpact: false,
      toggleSource: (s) => {
        const cur = get().sources;
        set({ sources: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s] });
      },
      toggleLanguage: (lang) => {
        const cur = get().languages;
        set({ languages: cur.includes(lang) ? cur.filter((x) => x !== lang) : [...cur, lang] });
      },
      clearSources: () => set({ sources: [] }),
      setAllSources: (list) => set({ sources: list }),
      toggleHideLow: () => set({ hideLowImpact: !get().hideLowImpact })
    }),
    { name: 'financaonboard:news-filter', version: 1 }
  )
);
