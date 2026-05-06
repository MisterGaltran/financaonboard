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
    <td className={`px-2 py-1.5 text-right tabular-nums text-text-primary ${flash}`}>
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
  if (diffDays === 1) return `AMANHA · ${weekday} ${dm}`;
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
  const rowDim = isPast ? 'opacity-40' : '';
  return (
    <tr data-event-id={e.id} className={`border-b border-border/50 row-hover ${rowDim}`}>
      <td className="px-2 py-1.5 tabular-nums text-info">{time}</td>
      <td className="px-2 py-1.5 text-text-secondary"><span className="mr-1">{flagFor(e.country)}</span>{e.country}</td>
      <td className="px-2 py-1.5 text-text-primary">{e.event}</td>
      <ActualCell value={e.actual} />
      <td className="px-2 py-1.5 text-right tabular-nums text-text-secondary">{e.estimate ?? '—'}</td>
      <td className="px-2 py-1.5 text-right tabular-nums text-text-secondary">{e.previous ?? '—'}</td>
      <td className="px-2 py-1.5 text-center">
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
    <div className="bg-surface-alt h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-surface border-b border-border-hi">
        <h2 className="text-ui-xs font-semibold tracking-widest text-text-primary flex-shrink-0">CALENDARIO</h2>
        <CountryFilter events={events} />
        <span className="ml-auto text-ui-xs text-text-secondary flex-shrink-0 tabular-nums">
          {sorted.length}/{events.length}
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-ui-sm">
          <thead className="sticky top-0 bg-surface-alt border-b border-border-hi text-text-primary uppercase text-ui-xs tracking-widest">
            <tr>
              <th className="text-left font-medium px-2 py-1.5">T</th>
              <th className="text-left font-medium px-2 py-1.5">PAIS</th>
              <th className="text-left font-medium px-2 py-1.5">EVENTO</th>
              <th className="text-right font-medium px-2 py-1.5">REAL</th>
              <th className="text-right font-medium px-2 py-1.5">EST</th>
              <th className="text-right font-medium px-2 py-1.5">ANT</th>
              <th className="text-center font-medium px-2 py-1.5">IMP</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="px-2 py-8 text-center text-text-secondary text-ui-sm">Nenhum evento encontrado</td></tr>
            )}
            {grouped.map((group) => (
              <Fragment key={group.key}>
                <tr>
                  <td colSpan={7} className="sticky top-[30px] bg-surface-hover border-y border-border-hi px-3 py-1 text-ui-xs font-semibold tracking-widest text-accent">
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
