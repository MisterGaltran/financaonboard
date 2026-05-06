import { useEffect, useState } from 'react';
import { useIndicesStore } from '../../store/indicesStore';

function getMarketStatus() {
  const now = new Date();

  const brTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const brMinutes = brTime.getHours() * 60 + brTime.getMinutes();
  const brDay = brTime.getDay();
  const b3Open = brDay >= 1 && brDay <= 5 && brMinutes >= 600 && brMinutes < 1020;

  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const nyMinutes = nyTime.getHours() * 60 + nyTime.getMinutes();
  const nyDay = nyTime.getDay();
  const nyseOpen = nyDay >= 1 && nyDay <= 5 && nyMinutes >= 570 && nyMinutes < 960;

  const clock = now.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return { b3Open, nyseOpen, clock };
}

const Dot = ({ open }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full ${open ? 'bg-positive' : 'bg-negative'}`} />
);

function IndexBadge({ label, data, isOpen }) {
  if (!data) {
    return (
      <span className="flex items-center gap-1.5">
        <Dot open={isOpen} />
        <span className="text-text-secondary tracking-wider">{label}</span>
        <span className={isOpen ? 'text-positive' : 'text-negative'}>
          {isOpen ? '—' : '—'}
        </span>
      </span>
    );
  }

  const pct = data.changePct;
  const up = pct != null && pct > 0;
  const down = pct != null && pct < 0;
  const color = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
  const arrow = up ? '▲' : down ? '▼' : '';

  const fmtPrice = (p) => {
    if (p == null) return '—';
    if (p >= 10000) return p.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    if (p >= 100) return p.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    return p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <span className="flex items-center gap-1.5">
      <Dot open={isOpen} />
      <span className="text-text-secondary tracking-wider">{label}</span>
      <span className={`tabular-nums font-semibold ${color}`}>
        {fmtPrice(data.price)}
      </span>
      {pct != null && (
        <span className={`tabular-nums ${color}`}>
          {arrow} {Math.abs(pct).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

export default function MarketClock() {
  const [status, setStatus] = useState(getMarketStatus);
  const ibov = useIndicesStore((s) => s.ibov);
  const sp500 = useIndicesStore((s) => s.sp500);
  const btc = useIndicesStore((s) => s.btc);

  useEffect(() => {
    const t = setInterval(() => setStatus(getMarketStatus()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-4 text-ui-xs">
      <div className="flex items-center gap-3">
        <IndexBadge label="IBOV" data={ibov} isOpen={status.b3Open} />
        <span className="h-3 w-px bg-border-hi" />
        <IndexBadge label="S&P" data={sp500} isOpen={status.nyseOpen} />
        <span className="h-3 w-px bg-border-hi" />
        <IndexBadge label="BTC" data={btc} isOpen={true} />
      </div>

      <span className="tabular-nums text-ui-sm font-semibold text-text-primary tracking-wider">
        {status.clock}
        <span className="text-text-secondary ml-1 text-ui-xs font-normal">BRT</span>
      </span>
    </div>
  );
}
