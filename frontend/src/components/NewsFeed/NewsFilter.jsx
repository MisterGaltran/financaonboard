import { useMemo, useState } from 'react';
import { useNewsFilterStore } from '../../store/newsFilterStore';

const LANG_LABEL = { pt: '🇧🇷PT', en: '🇺🇸EN' };

export default function NewsFilter({ items }) {
  const [open, setOpen] = useState(false);
  const sources = useNewsFilterStore((s) => s.sources);
  const languages = useNewsFilterStore((s) => s.languages);
  const hideLow = useNewsFilterStore((s) => s.hideLowImpact);
  const toggleSource = useNewsFilterStore((s) => s.toggleSource);
  const toggleLanguage = useNewsFilterStore((s) => s.toggleLanguage);
  const clearSources = useNewsFilterStore((s) => s.clearSources);
  const setAllSources = useNewsFilterStore((s) => s.setAllSources);
  const toggleHideLow = useNewsFilterStore((s) => s.toggleHideLow);

  const sourceList = useMemo(() => {
    const counts = new Map();
    for (const n of items) {
      const s = n.source || '??';
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {['pt', 'en'].map((lang) => {
        const on = languages.includes(lang);
        return (
          <button
            key={lang}
            onClick={() => toggleLanguage(lang)}
            className={`px-1.5 py-0.5 text-[10px] uppercase tracking-widest border ${on ? 'bg-bbg-yellow/20 border-bbg-yellow text-bbg-yellow' : 'bg-black border-bbg-border text-bbg-muted hover:border-bbg-amber'}`}
          >
            {LANG_LABEL[lang]}
          </button>
        );
      })}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-1.5 py-0.5 text-[10px] uppercase tracking-widest bg-black border border-bbg-border hover:border-bbg-amber text-bbg-amber"
        >
          {sources.length === 0 ? 'ALL·SRC' : `${sources.length}·SRC`} ▾
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute top-full mt-1 right-0 z-30 w-60 max-h-80 overflow-y-auto bg-bbg-panel border border-bbg-border-hi shadow-xl">
              <div className="sticky top-0 flex items-center justify-between gap-2 px-2 py-1 bg-black border-b border-bbg-border text-[10px] uppercase tracking-widest">
                <span className="text-bbg-muted">{sources.length === 0 ? 'ALL' : `${sources.length} SEL`}</span>
                <div className="flex gap-2">
                  <button onClick={() => setAllSources(sourceList.map((s) => s.name))} className="text-bbg-muted hover:text-bbg-white">ALL</button>
                  <button onClick={clearSources} className="text-bbg-muted hover:text-bbg-red">CLR</button>
                </div>
              </div>
              <ul className="py-0.5">
                {sourceList.map(({ name, count }) => {
                  const on = sources.includes(name);
                  return (
                    <li key={name}>
                      <button
                        onClick={() => toggleSource(name)}
                        className={`w-full flex items-center justify-between gap-2 px-2 py-1 text-bbg-xs hover:bg-bbg-panel-alt ${on ? 'bg-bbg-panel-alt text-bbg-amber' : 'text-bbg-muted'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 border ${on ? 'bg-bbg-amber border-bbg-amber' : 'border-bbg-muted'}`} />
                          <span className="truncate max-w-[140px]">{name}</span>
                        </span>
                        <span className="text-[10px] text-bbg-muted tabular-nums">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>

      <label className="flex items-center gap-1 text-[10px] text-bbg-muted cursor-pointer select-none tracking-widest">
        <input type="checkbox" checked={hideLow} onChange={toggleHideLow} className="accent-bbg-yellow" />
        HIGH·ONLY
      </label>
    </div>
  );
}
