import { useEffect, useState } from 'react';

function getMarketStatus() {
  const now = new Date();

  // B3: 10:00-17:00 BRT (America/Sao_Paulo)
  const brTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const brH = brTime.getHours();
  const brM = brTime.getMinutes();
  const brMinutes = brH * 60 + brM;
  const brDay = brTime.getDay();
  const b3Open = brDay >= 1 && brDay <= 5 && brMinutes >= 600 && brMinutes < 1020;

  // NYSE: 09:30-16:00 ET (America/New_York)
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const nyH = nyTime.getHours();
  const nyM = nyTime.getMinutes();
  const nyMinutes = nyH * 60 + nyM;
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

export default function MarketClock() {
  const [status, setStatus] = useState(getMarketStatus);

  useEffect(() => {
    const t = setInterval(() => setStatus(getMarketStatus()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-4 text-ui-xs">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <Dot open={status.b3Open} />
          <span className="text-text-secondary tracking-wider">B3</span>
          <span className={status.b3Open ? 'text-positive' : 'text-negative'}>
            {status.b3Open ? 'ABERTO' : 'FECHADO'}
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          <Dot open={status.nyseOpen} />
          <span className="text-text-secondary tracking-wider">NYSE</span>
          <span className={status.nyseOpen ? 'text-positive' : 'text-negative'}>
            {status.nyseOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          <Dot open={true} />
          <span className="text-text-secondary tracking-wider">CRYPTO</span>
          <span className="text-positive">24H</span>
        </span>
      </div>

      <span className="tabular-nums text-ui-sm font-semibold text-text-primary tracking-wider">
        {status.clock}
        <span className="text-text-secondary ml-1 text-ui-xs font-normal">BRT</span>
      </span>
    </div>
  );
}
