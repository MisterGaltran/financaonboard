import { Fragment, useEffect, useMemo, useState } from 'react';
import { useCalendarStore } from '../../store/calendarStore';
import { useCalendarFilterStore } from '../../store/calendarFilterStore';
import { fetchCalendar } from '../../services/apiClient';
import { impactClass, impactLabel, IMPACT_BADGE_CLASS } from '../../utils/formatters';
import { flagFor } from '../../utils/countries';
import { useFlash } from '../../hooks/useFlash';
import CountryFilter from './CountryFilter';

function ActualCell({ value }) {
  const flash = useFlash(typeof value === 'number' ? value : parseFloat(value));
  return (
    <td className={`px-2 py-1 text-right tabular-nums text-bbg-white ${flash}`}>
      {value ?? '—'}
    </td>
  );
}

function parseEventTs(t) {
  if (!t) return NaN;
  const iso = String(t).replace(' ', 'T');
  const d = new Date(iso);
  return d.getTime();
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(ts, now) {
  const d = new Date(ts);
  const today = new Date(now);
  const diffDays = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
  const dm = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (diffDays === 0) return `HOJE · ${weekday} ${dm}`;
  if (diffDays === 1) return `AMANHÃ · ${weekday} ${dm}`;
  if (diffDays === -1) return `ONTEM · ${weekday} ${dm}`;
  return `${weekday} · ${dm}`;
}

function groupByDay(events, now) {
  const groups = [];
  let current = null;
  for (const e of events) {
    const ts = parseEventTs(e.time);
    const key = Number.isNaN(ts) ? 'unknown' : dayKey(ts);
    if (!current || current.key !== key) {
      current = { key, label: Number.isNaN(ts) ? 'SEM DATA' : dayLabel(ts, now), events: [] };
      groups.push(current);
    }
    current.events.push(e);
  }
  return groups;
}

function Row({ e, now }) {
  const ts = parseEventTs(e.time);
  const isPast = !Number.isNaN(ts) && ts < now;
  const time = String(e.time).slice(11, 16) || String(e.time).slice(0, 10);
  const rowDim = isPast ? 'opacity-50' : '';
  return (
    <tr data-event-id={e.id} className={`border-b border-bbg-border/50 bbg-row-hover ${rowDim}`}>
      <td className="px-2 py-1 tabular-nums text-bbg-cyan">{time}</td>
      <td className="px-2 py-1 text-bbg-muted"><span className="mr-1">{flagFor(e.country)}</span>{e.country}</td>
      <td className="px-2 py-1 text-bbg-amber">{e.event}</td>
      <ActualCell value={e.actual} />
      <td className="px-2 py-1 text-right tabular-nums text-bbg-muted">{e.estimate ?? '—'}</td>
      <td className="px-2 py-1 text-right tabular-nums text-bbg-muted">{e.previous ?? '—'}</td>
      <td className="px-2 py-1 text-center">
        <span className={`${IMPACT_BADGE_CLASS} ${impactClass(e.impact)}`}>
          {impactLabel(e.impact)}
        </span>
      </td>
    </tr>
  );
}

export default function EconomicCalendar() {
  const events = useCalendarStore((s) => s.events);
  const setEvents = useCalendarStore((s) => s.setEvents);
  const selectedCountries = useCalendarFilterStore((s) => s.selected);
  const hideLowImpact = useCalendarFilterStore((s) => s.hideLowImpact);
  const next24h = useCalendarFilterStore((s) => s.next24h);
  const hidePast = useCalendarFilterStore((s) => s.hidePast);

  useEffect(() => {
    if (events.length === 0) {
      fetchCalendar().then(setEvents).catch(() => {});
    }
  }, [events.length, setEvents]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => {
    const selectedSet = new Set(selectedCountries);
    const windowEnd = now + 24 * 3600 * 1000;
    const filtered = events.filter((e) => {
      if (selectedSet.size > 0 && !selectedSet.has(e.country)) return false;
      if (hideLowImpact && e.impact === 'low') return false;
      const ts = parseEventTs(e.time);
      if (hidePast && !Number.isNaN(ts) && ts < now) return false;
      if (next24h && !Number.isNaN(ts) && (ts < now - 3600_000 || ts > windowEnd)) return false;
      return true;
    });
    return filtered.sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }, [events, selectedCountries, hideLowImpact, next24h, hidePast, now]);

  const grouped = useMemo(() => groupByDay(sorted, now), [sorted, now]);

  return (
    <div className="bg-bbg-panel h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-black border-b border-bbg-border-hi">
        <h2 className="text-bbg-xs font-bold tracking-widest text-bbg-white flex-shrink-0">ECON·CALENDAR</h2>
        <CountryFilter events={events} />
        <span className="ml-auto text-bbg-xs text-bbg-muted flex-shrink-0 tabular-nums">
          {sorted.length}/{events.length}
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-bbg-sm">
          <thead className="sticky top-0 bg-bbg-panel border-b border-bbg-border-hi text-bbg-white uppercase text-[10px] tracking-widest">
            <tr>
              <th className="text-left font-normal px-2 py-1">T</th>
              <th className="text-left font-normal px-2 py-1">CTRY</th>
              <th className="text-left font-normal px-2 py-1">EVENT</th>
              <th className="text-right font-normal px-2 py-1">ACT</th>
              <th className="text-right font-normal px-2 py-1">EST</th>
              <th className="text-right font-normal px-2 py-1">PREV</th>
              <th className="text-center font-normal px-2 py-1">IMP</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="px-2 py-6 text-center text-bbg-muted">NO EVENTS MATCH FILTER</td></tr>
            )}
            {grouped.map((group) => (
              <Fragment key={group.key}>
                <tr>
                  <td colSpan={7} className="sticky top-[28px] bg-bbg-panel-alt border-y border-bbg-border-hi px-2 py-0.5 text-[10px] font-bold tracking-widest text-bbg-yellow">
                    {group.label} · {group.events.length}
                  </td>
                </tr>
                {group.events.map((e) => <Row key={e.id} e={e} now={now} />)}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
