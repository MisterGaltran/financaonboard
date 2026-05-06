import { useMemo } from 'react';
import { useNewsStore } from '../../store/newsStore';
import { fmtHHMM } from '../../utils/formatters';

export default function NewsTicker() {
  const items = useNewsStore((s) => s.items);

  const headlines = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, 30);
  }, [items]);

  if (!headlines.length) {
    return (
      <div className="bg-surface border-t border-border-hi px-4 py-1.5 text-ui-xs text-text-secondary tracking-widest">
        NEWS TICKER · AGUARDANDO FEED...
      </div>
    );
  }

  const duration = `${Math.max(90, headlines.length * 6)}s`;

  return (
    <div className="bg-surface border-t border-border-hi overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex items-center px-3 py-1 bg-accent text-white text-ui-xs font-semibold tracking-widest">
          NEWS
        </div>
        <div className="flex-1 overflow-hidden marquee-wrapper relative">
          <div className="marquee-track" style={{ '--marquee-duration': duration }}>
            {[...headlines, ...headlines].map((n, idx) => (
              <a
                key={`${n.id}-${idx}`}
                href={n.url || '#'}
                target={n.url ? '_blank' : undefined}
                rel="noreferrer"
                className="flex-shrink-0 flex items-center gap-2 px-4 py-1 text-ui-xs border-r border-border hover:bg-surface-hover"
              >
                <span className="tabular-nums text-info">{fmtHHMM(n.datetime)}</span>
                <span className="uppercase text-text-secondary max-w-[100px] truncate">{n.source}</span>
                <span className={`uppercase text-[10px] ${n.impact === 'high' ? 'text-negative font-bold' : 'text-text-secondary'}`}>
                  {n.impact === 'high' ? '!' : '·'}
                </span>
                <span className="text-text-primary truncate max-w-[600px]">{n.headline}</span>
              </a>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent" />
        </div>
      </div>
    </div>
  );
}
