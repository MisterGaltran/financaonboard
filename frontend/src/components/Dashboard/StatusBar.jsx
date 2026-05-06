import { useConnectionStore } from '../../store/connectionStore';

const dot = (color) => `inline-block w-1.5 h-1.5 rounded-full ${color}`;

export default function StatusBar() {
  const status = useConnectionStore((s) => s.status);
  const providers = useConnectionStore((s) => s.providers);

  const isConnected = status === 'connected';

  const providerDot = (p) => {
    if (p === 'ready' || p === 'authed' || p === 'connected' || p === 'polling') return dot('bg-positive');
    if (p === 'rest-polling') return dot('bg-warning');
    if (p === 'connecting' || p === 'reconnecting') return dot('bg-warning animate-pulse');
    if (p === 'disabled' || p === 'no-token') return dot('bg-text-secondary');
    return dot('bg-negative');
  };

  return (
    <div className="flex items-center gap-3 text-ui-xs">
      <span className="flex items-center gap-1.5">
        <span className={isConnected ? dot('bg-positive') : dot('bg-negative animate-pulse')} />
        <span className={`uppercase tracking-wider ${isConnected ? 'text-positive' : 'text-negative'}`}>
          {isConnected ? 'LIVE' : 'OFF'}
        </span>
      </span>

      <span className="h-3 w-px bg-border-hi" />

      <div className="flex items-center gap-2.5 text-text-secondary">
        {Object.entries(providers).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1" title={`${key}: ${val}`}>
            <span className={providerDot(val)} />
            <span className="tracking-wider">{key === 'brRss' ? 'RSS' : key.toUpperCase()}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
