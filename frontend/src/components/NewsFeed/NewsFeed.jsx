import { useEffect, useMemo, useState } from 'react';
import { useNewsStore } from '../../store/newsStore';
import { useNewsFilterStore } from '../../store/newsFilterStore';
import { fetchNews } from '../../services/apiClient';
import { fmtDateTime, impactClass, impactLabel, IMPACT_BADGE_CLASS } from '../../utils/formatters';
import NewsFilter from './NewsFilter';

export default function NewsFeed() {
  const items = useNewsStore((s) => s.items);
  const setInitial = useNewsStore((s) => s.setInitial);
  const languages = useNewsFilterStore((s) => s.languages);
  const sources = useNewsFilterStore((s) => s.sources);
  const hideLow = useNewsFilterStore((s) => s.hideLowImpact);

  useEffect(() => {
    if (items.length === 0) {
      fetchNews('general').then(setInitial).catch(() => {});
    }
  }, [items.length, setInitial]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => {
    const langSet = new Set(languages);
    const srcSet = new Set(sources);
    return items
      .filter((n) => {
        if (langSet.size && !langSet.has((n.language || 'en').toLowerCase())) return false;
        if (srcSet.size && !srcSet.has(n.source)) return false;
        if (hideLow && n.impact !== 'high') return false;
        return true;
      })
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, 100);
  }, [items, languages, sources, hideLow]);

  return (
    <div className="bg-surface-alt h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-surface border-b border-border-hi">
        <h2 className="text-ui-xs font-semibold tracking-widest text-text-primary flex-shrink-0">NEWS</h2>
        <NewsFilter items={items} />
        <span className="ml-auto text-ui-xs text-text-secondary flex-shrink-0 tabular-nums">{sorted.length}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {sorted.length === 0 && (
          <div className="px-4 py-8 text-center text-ui-sm text-text-secondary">Nenhuma noticia encontrada</div>
        )}
        {sorted.map((n) => {
          const age = now - (n.datetime || 0);
          const isFresh = age >= 0 && age < 5 * 60_000;
          const isStale = age > 60 * 60_000;
          const highlight = isFresh ? 'border-l-2 border-l-accent' : 'border-l-2 border-l-transparent';
          const dim = isStale ? 'opacity-70' : '';
          return (
            <article key={n.id} className={`pl-3 pr-4 py-2 border-b border-border/40 row-hover ${highlight} ${dim} animate-fade-in`}>
              <div className="flex items-center gap-2 text-ui-xs text-text-secondary tracking-wider">
                <span className="tabular-nums text-info">{fmtDateTime(n.datetime)}</span>
                {isFresh && <span className="text-accent font-semibold">NEW</span>}
                <span className="text-text-secondary uppercase truncate max-w-[120px]">{n.source}</span>
                {n.language === 'pt' && <span className="text-text-secondary">BR</span>}
                <span className="ml-auto">
                  <span className={`${IMPACT_BADGE_CLASS} ${impactClass(n.impact)}`}>
                    {impactLabel(n.impact)}
                  </span>
                </span>
              </div>
              {n.url ? (
                <a href={n.url} target="_blank" rel="noreferrer" className="block text-ui-base leading-snug text-text-primary hover:text-accent-light mt-0.5">
                  {n.headline}
                </a>
              ) : (
                <div className="text-ui-base leading-snug text-text-primary mt-0.5">{n.headline}</div>
              )}
              {n.tickers?.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {n.tickers.slice(0, 8).map((t) => (
                    <span key={t} className="text-ui-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/30">{t}</span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
