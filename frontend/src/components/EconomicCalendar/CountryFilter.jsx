import { useMemo, useState } from 'react';
import { useCalendarFilterStore } from '../../store/calendarFilterStore';
import { flagFor } from '../../utils/countries';

export default function CountryFilter({ events }) {
  const [open, setOpen] = useState(false);
  const selected = useCalendarFilterStore((s) => s.selected);
  const hideLow = useCalendarFilterStore((s) => s.hideLowImpact);
  const next24h = useCalendarFilterStore((s) => s.next24h);
  const hidePast = useCalendarFilterStore((s) => s.hidePast);
  const toggle = useCalendarFilterStore((s) => s.toggle);
  const setAll = useCalendarFilterStore((s) => s.setAll);
  const clear = useCalendarFilterStore((s) => s.clear);
  const toggleHideLow = useCalendarFilterStore((s) => s.toggleHideLow);
  const toggleNext24h = useCalendarFilterStore((s) => s.toggleNext24h);
  const toggleHidePast = useCalendarFilterStore((s) => s.toggleHidePast);

  const countries = useMemo(() => {
    const counts = new Map();
    for (const e of events) {
      const c = e.country || '??';
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([code, count]) => ({ code, count }));
  }, [events]);

  const label =
    selected.length === 0 ? 'ALL'
      : selected.length <= 3 ? selected.map(flagFor).join(' ')
        : `${selected.length} CTRY`;

  const Chip = ({ on, onClick, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`px-1.5 py-0.5 text-ui-xs uppercase tracking-widest rounded border ${on ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2 py-0.5 text-ui-xs uppercase tracking-widest rounded bg-surface border border-border hover:border-accent text-text-primary"
      >
        {label} ▾
      </button>
      <Chip on={next24h} onClick={toggleNext24h} title="Proximas 24h">24H</Chip>
      <Chip on={hidePast} onClick={toggleHidePast} title="Ocultar passados">FUT</Chip>
      <Chip on={hideLow} onClick={toggleHideLow} title="Ocultar baixo impacto">H·M</Chip>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-30 w-60 max-h-80 overflow-y-auto bg-surface-alt border border-border-hi rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 flex items-center justify-between gap-2 px-3 py-1.5 bg-surface border-b border-border rounded-t text-ui-xs uppercase tracking-widest">
              <span className="text-text-secondary">{selected.length === 0 ? 'ALL' : `${selected.length} SEL`}</span>
              <div className="flex gap-2">
                <button onClick={() => setAll(countries.map((c) => c.code))} className="text-text-secondary hover:text-text-primary">ALL</button>
                <button onClick={clear} className="text-text-secondary hover:text-negative">CLR</button>
              </div>
            </div>
            <ul className="py-0.5">
              {countries.map(({ code, count }) => {
                const on = selected.includes(code);
                return (
                  <li key={code}>
                    <button
                      onClick={() => toggle(code)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-ui-xs hover:bg-surface-hover ${on ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm border ${on ? 'bg-accent border-accent' : 'border-text-secondary'}`} />
                        <span>{flagFor(code)}</span>
                        <span className="tabular-nums tracking-wider">{code}</span>
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
  );
}
