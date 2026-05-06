import { useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import { useAlertStore } from '../../store/alertStore';
import { fmtDateTime } from '../../utils/formatters';

export default function AlertPopup() {
  const { current, count } = useAlert();
  const acknowledge = useAlertStore((s) => s.acknowledge);
  const clearAll = useAlertStore((s) => s.clearAll);
  const soundEnabled = useAlertStore((s) => s.soundEnabled);
  const enableSound = useAlertStore((s) => s.enableSound);

  useEffect(() => {
    if (!current) return;
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        acknowledge(current.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, acknowledge]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-3xl mx-4 border-2 border-negative bg-surface-alt rounded animate-border-pulse">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-negative bg-negative/10 rounded-t">
          <div className="flex items-center gap-3">
            <span className="text-negative text-2xl font-black animate-pulse">!</span>
            <div className="leading-tight">
              <div className="text-ui-xs uppercase tracking-[0.3em] text-negative font-bold">HIGH IMPACT ALERT</div>
              <div className="text-ui-xs text-text-secondary tabular-nums tracking-wider">{fmtDateTime(current.timestamp)}</div>
            </div>
          </div>
          {count > 1 && (
            <div className="text-ui-xs text-warning tracking-widest">+{count - 1} NA FILA</div>
          )}
        </div>

        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-bold leading-snug mb-2 text-text-primary">{current.title}</h3>
          {current.message && (
            <p className="text-ui-base text-text-secondary leading-relaxed">{current.message}</p>
          )}
          {current.tickers?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {current.tickers.map((t) => (
                <span key={t} className="text-ui-xs px-2 py-0.5 rounded bg-negative/20 text-negative border border-negative font-semibold tracking-wider">{t}</span>
              ))}
            </div>
          ) : null}
          {current.source && (
            <div className="mt-3 text-ui-xs uppercase text-text-secondary tracking-widest">FONTE · {current.source}</div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 py-3 bg-surface rounded-b">
          {!soundEnabled && (
            <button
              onClick={enableSound}
              className="px-3 py-1.5 text-ui-xs rounded bg-warning/20 text-warning border border-warning hover:bg-warning/30 tracking-widest"
            >
              ATIVAR SOM
            </button>
          )}
          {current.url && (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-ui-xs rounded text-text-primary border border-border hover:border-accent tracking-widest"
            >
              FONTE ↗
            </a>
          )}
          <div className="ml-auto flex gap-2">
            {count > 1 && (
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-ui-xs rounded text-text-secondary border border-border hover:border-negative hover:text-negative tracking-widest"
              >
                LIMPAR TUDO
              </button>
            )}
            <button
              onClick={() => acknowledge(current.id)}
              className="px-4 py-1.5 text-ui-xs font-bold rounded bg-negative text-white hover:bg-negative/80 tracking-widest"
            >
              ACK · ENTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
