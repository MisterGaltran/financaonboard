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

  const color = up ? 'text-bbg-green' : down ? 'text-bbg-red' : 'text-bbg-amber-dim';
  const symbolColor = up ? 'text-bbg-green' : down ? 'text-bbg-red' : 'text-bbg-white';
  const arrow = up ? '▲' : down ? '▼' : '·';

  return (
    <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1 border-r border-bbg-border ${flash}`}>
      <span className={`text-bbg-xs font-bold tracking-wider ${symbolColor}`}>{q.symbol}</span>
      <span className={`text-bbg-xs tabular-nums ${color}`}>{fmtNum(q.price)}</span>
      <span className={`text-bbg-xs tabular-nums font-bold ${color}`}>
        {pct == null ? '' : `${arrow}${Math.abs(pct).toFixed(2)}%`}
      </span>
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
    <div className="bg-bbg-panel border-b border-bbg-border overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex flex-col justify-center px-2 py-1 border-r border-bbg-border bg-black z-10 leading-tight">
          <div className="text-bbg-xs text-bbg-yellow font-bold tracking-widest">IBOV</div>
          <div className="tabular-nums text-[9px] text-bbg-muted tracking-normal">
            {quotes.length ? `${quotes.length}·${fmtTime(lastUpdate)}` : '...'}
          </div>
        </div>

        <div className="flex-1 overflow-hidden marquee-wrapper relative">
          {quotes.length === 0 ? (
            <div className="px-3 py-2 text-bbg-xs text-bbg-muted">LOADING IBOV COMPOSITION...</div>
          ) : (
            <div className="marquee-track" style={{ '--marquee-duration': duration }}>
              {[...quotes, ...quotes].map((q, idx) => (
                <QuoteItem key={`${q.symbol}-${idx}`} q={q} />
              ))}
            </div>
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-bbg-panel to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-bbg-panel to-transparent" />
        </div>
      </div>
    </div>
  );
}
