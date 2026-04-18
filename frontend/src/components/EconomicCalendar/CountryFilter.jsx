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
      className={`px-1.5 py-0.5 text-[10px] uppercase tracking-widest border ${on ? 'bg-bbg-yellow text-black border-bbg-yellow' : 'bg-black border-bbg-border text-bbg-muted hover:border-bbg-amber'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-black border border-bbg-border hover:border-bbg-amber text-bbg-amber"
      >
        {label} ▾
      </button>
      <Chip on={next24h} onClick={toggleNext24h} title="mostra só eventos nas próximas 24h">24H</Chip>
      <Chip on={hidePast} onClick={toggleHidePast} title="oculta eventos cujo horário já passou">FUT</Chip>
      <Chip on={hideLow} onClick={toggleHideLow} title="oculta eventos de baixo impacto">H·M</Chip>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-30 w-60 max-h-80 overflow-y-auto bg-bbg-panel border border-bbg-border-hi shadow-xl">
            <div className="sticky top-0 flex items-center justify-between gap-2 px-2 py-1 bg-black border-b border-bbg-border text-[10px] uppercase tracking-widest">
              <span className="text-bbg-muted">{selected.length === 0 ? 'ALL' : `${selected.length} SEL`}</span>
              <div className="flex gap-2">
                <button onClick={() => setAll(countries.map((c) => c.code))} className="text-bbg-muted hover:text-bbg-white">ALL</button>
                <button onClick={clear} className="text-bbg-muted hover:text-bbg-red">CLR</button>
              </div>
            </div>
            <ul className="py-0.5">
              {countries.map(({ code, count }) => {
                const on = selected.includes(code);
                return (
                  <li key={code}>
                    <button
                      onClick={() => toggle(code)}
                      className={`w-full flex items-center justify-between gap-2 px-2 py-1 text-bbg-xs hover:bg-bbg-panel-alt ${on ? 'bg-bbg-panel-alt text-bbg-amber' : 'text-bbg-muted'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 border ${on ? 'bg-bbg-amber border-bbg-amber' : 'border-bbg-muted'}`} />
                        <span>{flagFor(code)}</span>
                        <span className="tabular-nums tracking-wider">{code}</span>
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
  );
}
