import { useMemo, useState } from 'react';
import { useNewsFilterStore } from '../../store/newsFilterStore';

const LANG_LABEL = { pt: 'PT', en: 'EN' };

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
            className={`px-1.5 py-0.5 text-ui-xs uppercase tracking-widest rounded border ${on ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
          >
            {LANG_LABEL[lang]}
          </button>
        );
      })}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-1.5 py-0.5 text-ui-xs uppercase tracking-widest rounded bg-surface border border-border hover:border-accent text-text-primary"
        >
          {sources.length === 0 ? 'ALL SRC' : `${sources.length} SRC`} ▾
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute top-full mt-1 right-0 z-30 w-60 max-h-80 overflow-y-auto bg-surface-alt border border-border-hi rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="sticky top-0 flex items-center justify-between gap-2 px-3 py-1.5 bg-surface border-b border-border rounded-t text-ui-xs uppercase tracking-widest">
                <span className="text-text-secondary">{sources.length === 0 ? 'ALL' : `${sources.length} SEL`}</span>
                <div className="flex gap-2">
                  <button onClick={() => setAllSources(sourceList.map((s) => s.name))} className="text-text-secondary hover:text-text-primary">ALL</button>
                  <button onClick={clearSources} className="text-text-secondary hover:text-negative">CLR</button>
                </div>
              </div>
              <ul className="py-0.5">
                {sourceList.map(({ name, count }) => {
                  const on = sources.includes(name);
                  return (
                    <li key={name}>
                      <button
                        onClick={() => toggleSource(name)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-ui-xs hover:bg-surface-hover ${on ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-sm border ${on ? 'bg-accent border-accent' : 'border-text-secondary'}`} />
                          <span className="truncate max-w-[140px]">{name}</span>
                        </span>
                        <span className="text-ui-xs text-text-secondary tabular-nums">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>

      <button
        onClick={toggleHideLow}
        className={`px-1.5 py-0.5 text-ui-xs tracking-widest rounded border ${hideLow ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
      >
        HIGH
      </button>
    </div>
  );
}
