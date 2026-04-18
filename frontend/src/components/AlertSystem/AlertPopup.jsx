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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-3xl mx-4 border-2 border-bbg-red bg-black animate-border-pulse">
        <div className="flex items-center justify-between px-4 py-2 border-b-2 border-bbg-red bg-bbg-red/10">
          <div className="flex items-center gap-3">
            <span className="text-bbg-red text-2xl font-black animate-pulse">⚠</span>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-[0.3em] text-bbg-red font-bold">HIGH IMPACT ALERT</div>
              <div className="text-bbg-xs text-bbg-amber-dim tabular-nums tracking-wider">{fmtDateTime(current.timestamp)}</div>
            </div>
          </div>
          {count > 1 && (
            <div className="text-bbg-xs text-bbg-yellow tracking-widest">+{count - 1} QUEUED</div>
          )}
        </div>

        <div className="px-4 py-3 border-b border-bbg-border">
          <h3 className="text-bbg-md font-bold leading-snug mb-2 text-bbg-white">{current.title}</h3>
          {current.message && (
            <p className="text-bbg-sm text-bbg-amber leading-relaxed">{current.message}</p>
          )}
          {current.tickers?.length ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {current.tickers.map((t) => (
                <span key={t} className="text-bbg-xs px-1.5 py-0.5 bg-bbg-red/20 text-bbg-red border border-bbg-red font-bold tracking-wider">{t}</span>
              ))}
            </div>
          ) : null}
          {current.source && (
            <div className="mt-3 text-[10px] uppercase text-bbg-muted tracking-widest">SRC · {current.source}</div>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-bbg-panel">
          {!soundEnabled && (
            <button
              onClick={enableSound}
              className="px-2 py-1 text-[10px] bg-bbg-yellow/20 text-bbg-yellow border border-bbg-yellow hover:bg-bbg-yellow/30 tracking-widest"
            >
              ♪ ENABLE SOUND
            </button>
          )}
          {current.url && (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 text-[10px] text-bbg-amber border border-bbg-border hover:border-bbg-amber tracking-widest"
            >
              SOURCE ↗
            </a>
          )}
          <div className="ml-auto flex gap-2">
            {count > 1 && (
              <button
                onClick={clearAll}
                className="px-2 py-1 text-[10px] text-bbg-muted border border-bbg-border hover:border-bbg-red hover:text-bbg-red tracking-widest"
              >
                CLEAR·ALL
              </button>
            )}
            <button
              onClick={() => acknowledge(current.id)}
              className="px-4 py-1 text-[10px] font-bold bg-bbg-red text-black hover:bg-bbg-amber tracking-widest"
            >
              ACK · ENTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
