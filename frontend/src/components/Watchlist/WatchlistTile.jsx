import { useFlash } from '../../hooks/useFlash';
import { fmtNum } from '../../utils/formatters';

export default function WatchlistTile({ quote, symbol, onRemove }) {
  const flash = useFlash(quote?.price);
  const pct = quote?.changePct;
  const hasChange = pct != null && pct !== 0;
  const up = hasChange && pct > 0;
  const down = hasChange && pct < 0;
  const color = up ? 'text-bbg-green' : down ? 'text-bbg-red' : 'text-bbg-amber-dim';
  const symbolColor = up ? 'text-bbg-green' : down ? 'text-bbg-red' : 'text-bbg-white';
  const arrow = up ? '▲' : down ? '▼' : '·';

  return (
    <div className={`relative border border-bbg-border bg-bbg-panel p-1.5 group ${flash}`}>
      <button
        onClick={() => onRemove(symbol)}
        title="remover"
        className="absolute top-0 right-0 px-1 text-[10px] text-bbg-muted opacity-0 group-hover:opacity-100 hover:text-bbg-red"
      >
        ✕
      </button>
      {!quote ? (
        <>
          <div className="text-bbg-sm font-bold text-bbg-muted tracking-wider">{symbol}</div>
          <div className="text-[10px] text-bbg-muted mt-1">OUT OF TOP-100</div>
          <div className="text-[9px] text-bbg-muted/70">no data</div>
        </>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-bbg-sm font-bold tracking-wider ${symbolColor}`}>{symbol}</span>
            <span className={`text-bbg-xs tabular-nums font-bold ${color}`}>
              {pct == null ? '--' : `${arrow}${Math.abs(pct).toFixed(2)}%`}
            </span>
          </div>
          <div className={`text-bbg-md tabular-nums font-bold ${color} leading-tight mt-0.5`}>
            R$ {fmtNum(quote.price)}
          </div>
          <div className="flex items-center justify-between gap-2 text-[9px] text-bbg-muted tabular-nums mt-0.5 tracking-wider">
            <span>H {fmtNum(quote.high)}</span>
            <span>L {fmtNum(quote.low)}</span>
          </div>
          {quote.volume != null && (
            <div className="text-[9px] text-bbg-amber-dim tabular-nums mt-0.5 tracking-wider">
              VOL {formatVolume(quote.volume)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatVolume(v) {
  if (v == null) return '—';
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return String(v);
}
