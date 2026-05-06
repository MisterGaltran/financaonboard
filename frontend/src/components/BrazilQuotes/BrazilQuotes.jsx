import { useEffect, useMemo } from 'react';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import { fetchBrQuotes } from '../../services/apiClient';
import { fmtTime, fmtNum } from '../../utils/formatters';
import { useFlash } from '../../hooks/useFlash';

function QuoteItem({ q }) {
  const flash = useFlash(q.price);
  const pct = q.changePct;
  const hasChange = pct != null && pct !== 0;
  const up = hasChange && pct > 0;
  const down = hasChange && pct < 0;

  const color = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
  const symbolColor = up ? 'text-positive' : down ? 'text-negative' : 'text-text-primary';
  const arrow = up ? '▲' : down ? '▼' : '';

  return (
    <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1 border-r border-border ${flash}`}>
      <span className={`text-ui-xs font-semibold tracking-wider ${symbolColor}`}>{q.symbol}</span>
      <span className={`text-ui-xs tabular-nums ${color}`}>{fmtNum(q.price)}</span>
      <span className={`text-ui-xs tabular-nums font-semibold ${color}`}>
        {pct == null ? '' : `${arrow} ${Math.abs(pct).toFixed(2)}%`}
      </span>
    </div>
  );
}

function SkeletonQuotes() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton h-3 w-12" />
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

export default function BrazilQuotes() {
  const quotes = useBrQuotesStore((s) => s.quotes);
  const lastUpdate = useBrQuotesStore((s) => s.lastUpdate);
  const setQuotes = useBrQuotesStore((s) => s.setQuotes);
  const setError = useBrQuotesStore((s) => s.setError);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = await fetchBrQuotes();
        if (!cancelled && q.length) setQuotes(q);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [setQuotes, setError]);

  const duration = useMemo(() => {
    const baseSec = 3;
    return `${Math.max(60, Math.round(baseSec * Math.max(20, quotes.length)))}s`;
  }, [quotes.length]);

  return (
    <div className="bg-surface-alt border-b border-border overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex flex-col justify-center px-3 py-1 border-r border-border bg-surface z-10 leading-tight">
          <div className="text-ui-xs text-accent font-semibold tracking-widest">IBOV</div>
          <div className="tabular-nums text-[10px] text-text-secondary tracking-normal">
            {quotes.length ? `${quotes.length} · ${fmtTime(lastUpdate)}` : '...'}
          </div>
        </div>

        <div className="flex-1 overflow-hidden marquee-wrapper relative">
          {quotes.length === 0 ? (
            <SkeletonQuotes />
          ) : (
            <div className="marquee-track" style={{ '--marquee-duration': duration }}>
              {[...quotes, ...quotes].map((q, idx) => (
                <QuoteItem key={`${q.symbol}-${idx}`} q={q} />
              ))}
            </div>
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface-alt to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface-alt to-transparent" />
        </div>
      </div>
    </div>
  );
}
