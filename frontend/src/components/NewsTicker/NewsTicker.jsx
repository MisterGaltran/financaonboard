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
      <div className="bg-black border-t border-bbg-border-hi px-3 py-1 text-bbg-xs text-bbg-muted tracking-widest">
        NEWS TICKER · WAITING FOR FEED...
      </div>
    );
  }

  const duration = `${Math.max(90, headlines.length * 6)}s`;

  return (
    <div className="bg-black border-t border-bbg-border-hi overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex items-center px-2 py-1 bg-bbg-amber text-black text-bbg-xs font-bold tracking-widest">
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
                className="flex-shrink-0 flex items-center gap-2 px-4 py-1 text-bbg-xs border-r border-bbg-border hover:bg-bbg-panel"
              >
                <span className="tabular-nums text-bbg-cyan">{fmtHHMM(n.datetime)}</span>
                <span className="uppercase text-bbg-amber-dim max-w-[100px] truncate">{n.source}</span>
                <span className={`uppercase text-[9px] ${n.impact === 'high' ? 'text-bbg-red font-bold' : 'text-bbg-muted'}`}>
                  {n.impact === 'high' ? '⚠' : '·'}
                </span>
                <span className="text-bbg-amber truncate max-w-[600px]">{n.headline}</span>
              </a>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black to-transparent" />
        </div>
      </div>
    </div>
  );
}
