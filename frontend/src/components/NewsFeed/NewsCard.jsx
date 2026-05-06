import { useEffect } from 'react';
import { fmtDateTime, impactClass, impactLabel, IMPACT_BADGE_CLASS } from '../../utils/formatters';

export default function NewsCard({ news, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!news) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl mx-4 bg-surface-alt border border-border-hi rounded shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-ui-sm font-semibold text-text-primary uppercase tracking-wider">{news.source}</span>
            <span className="text-ui-xs text-text-secondary">·</span>
            <span className="text-ui-xs tabular-nums text-info tracking-wider">{fmtDateTime(news.datetime)}</span>
            {news.language === 'pt' && <span className="text-ui-xs text-text-secondary">BR</span>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-surface-hover text-ui-sm"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Headline */}
          <div className="px-5 pt-4 pb-3">
            <h2 className="text-[17px] font-bold leading-snug text-text-primary">
              {news.headline}
            </h2>
          </div>

          {/* Summary box */}
          {news.summary && (
            <div className="mx-5 mb-3 p-3 rounded bg-surface-hover border-l-2 border-l-accent">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-ui-xs font-semibold text-accent tracking-wider">Resumo</span>
                <span className={`${IMPACT_BADGE_CLASS} ${impactClass(news.impact)}`}>
                  {impactLabel(news.impact)}
                </span>
              </div>
              <p className="text-ui-sm text-text-secondary leading-relaxed">
                {news.summary}
              </p>
            </div>
          )}

          {/* Image */}
          {news.image && (
            <div className="mx-5 mb-3 rounded overflow-hidden border border-border">
              <img
                src={news.image}
                alt=""
                className="w-full h-auto max-h-[280px] object-cover bg-surface"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Tickers */}
          {news.tickers?.length > 0 && (
            <div className="px-5 mb-3 flex flex-wrap gap-1.5">
              {news.tickers.slice(0, 12).map((t) => (
                <span key={t} className="text-ui-xs px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/30 tracking-wider">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Category */}
          {news.category && (
            <div className="px-5 mb-3 flex flex-wrap gap-1.5">
              <span className="text-ui-xs px-2.5 py-1 rounded-full bg-surface-hover text-text-secondary border border-border tracking-wider uppercase">
                {news.category}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface">
          <span className="text-[10px] text-text-secondary tracking-widest">ESC FECHAR</span>
          {news.url && (
            <a
              href={news.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-accent text-white text-ui-xs font-semibold tracking-wider hover:bg-accent-light"
            >
              LER COMPLETO ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
