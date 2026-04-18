import { useConnectionStore } from '../../store/connectionStore';
import { useAlertStore } from '../../store/alertStore';
import { fireDebugAlert, fireDebugNews } from '../../services/apiClient';

const dot = (color) => `inline-block w-1.5 h-1.5 ${color}`;

export default function StatusBar() {
  const status = useConnectionStore((s) => s.status);
  const providers = useConnectionStore((s) => s.providers);
  const attempts = useConnectionStore((s) => s.attempts);
  const soundEnabled = useAlertStore((s) => s.soundEnabled);
  const enableSound = useAlertStore((s) => s.enableSound);

  const isConnected = status === 'connected';

  const providerDot = (p) => {
    if (p === 'ready' || p === 'authed' || p === 'connected' || p === 'polling') return dot('bg-bbg-green');
    if (p === 'rest-polling') return dot('bg-bbg-yellow');
    if (p === 'connecting' || p === 'reconnecting') return dot('bg-bbg-yellow animate-pulse');
    if (p === 'disabled' || p === 'no-token') return dot('bg-bbg-muted');
    return dot('bg-bbg-red');
  };

  const label = (key) => {
    const s = providers[key];
    if (s === 'rest-polling') return `${key.toUpperCase()}·REST`;
    return key.toUpperCase();
  };

  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-bbg-panel border-b border-bbg-border text-bbg-xs tracking-wider">
      <div className="flex items-center gap-1.5">
        <span className={isConnected ? dot('bg-bbg-green') : dot('bg-bbg-red animate-pulse')} />
        <span className="uppercase text-bbg-white">{status}</span>
        {attempts > 0 && !isConnected && (
          <span className="text-bbg-muted">#{attempts}</span>
        )}
      </div>

      <div className="h-3 w-px bg-bbg-border" />

      <div className="flex items-center gap-3 text-bbg-muted">
        <span className="flex items-center gap-1" title={providers.finnhub}><span className={providerDot(providers.finnhub)} />{label('finnhub')}</span>
        <span className="flex items-center gap-1" title={providers.eodhd}><span className={providerDot(providers.eodhd)} />{label('eodhd')}</span>
        <span className="flex items-center gap-1" title={providers.polygon}><span className={providerDot(providers.polygon)} />{label('polygon')}</span>
        <span className="flex items-center gap-1" title={providers.brapi}><span className={providerDot(providers.brapi)} />{label('brapi')}</span>
        <span className="flex items-center gap-1" title={providers.brRss}><span className={providerDot(providers.brRss)} />RSS·BR</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {!soundEnabled && (
          <button onClick={enableSound} className="px-2 py-0.5 bg-bbg-yellow/20 text-bbg-yellow border border-bbg-yellow/50 hover:bg-bbg-yellow/30">
            ♪ SOUND
          </button>
        )}
        <button
          onClick={() => fireDebugAlert({ title: 'TEST — CPI surprise', message: 'Simulação de alerta crítico.' })}
          className="px-2 py-0.5 text-bbg-muted border border-bbg-border hover:border-bbg-amber hover:text-bbg-amber"
        >
          TEST·ALERT
        </button>
        <button
          onClick={() => fireDebugNews({ headline: 'Fed surprise rate cut announced', impact: 'high' })}
          className="px-2 py-0.5 text-bbg-muted border border-bbg-border hover:border-bbg-amber hover:text-bbg-amber"
        >
          TEST·HIGH·NEWS
        </button>
      </div>
    </div>
  );
}
