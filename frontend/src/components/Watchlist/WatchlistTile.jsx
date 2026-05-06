import { useFlash } from '../../hooks/useFlash';
import { fmtNum } from '../../utils/formatters';

export default function WatchlistTile({ quote, symbol, onRemove }) {
  const flash = useFlash(quote?.price);
  const pct = quote?.changePct;
  const hasChange = pct != null && pct !== 0;
  const up = hasChange && pct > 0;
  const down = hasChange && pct < 0;
  const color = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
  const symbolColor = up ? 'text-positive' : down ? 'text-negative' : 'text-text-primary';
  const arrow = up ? '▲' : down ? '▼' : '';

  return (
    <div className={`relative rounded bg-surface-alt border border-border hover:border-accent transition-all duration-150 p-2.5 group ${flash}`}>
      <button
        onClick={() => onRemove(symbol)}
        title="remover"
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-ui-xs text-text-secondary opacity-0 group-hover:opacity-100 hover:text-negative hover:bg-negative/10"
      >
        ✕
      </button>
      {!quote ? (
        <div className="space-y-2">
          <div className="text-ui-sm font-semibold text-text-secondary tracking-wider">{symbol}</div>
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-ui-sm font-bold tracking-wider ${symbolColor}`}>{symbol}</span>
            <span className={`text-ui-xs tabular-nums font-semibold ${color}`}>
              {pct == null ? '--' : `${arrow} ${Math.abs(pct).toFixed(2)}%`}
            </span>
          </div>
          <div className={`text-[16px] tabular-nums font-bold ${color} leading-tight mt-1`}>
            R$ {fmtNum(quote.price)}
          </div>
          <div className="flex items-center justify-between gap-2 text-ui-xs text-text-secondary tabular-nums mt-1 tracking-wider">
            <span>H {fmtNum(quote.high)}</span>
            <span>L {fmtNum(quote.low)}</span>
          </div>
          {quote.volume != null && (
            <div className="text-ui-xs text-text-secondary tabular-nums mt-0.5 tracking-wider">
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
