const TZ = 'America/Sao_Paulo';

export const fmtTime = (ts) => {
  if (!ts) return '--:--:--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const fmtDateTime = (ts) => {
  if (!ts) return '--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const fmtHHMM = (ts) => {
  if (!ts) return '--:--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
};

export const impactClass = (impact) => {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'bg-negative text-white';
    case 'medium': return 'bg-warning text-black';
    default:       return 'bg-text-secondary/30 text-text-primary';
  }
};

export const impactLabel = (impact) => {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'H';
    case 'medium': return 'M';
    default:       return 'L';
  }
};

export const IMPACT_BADGE_CLASS = 'inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold leading-none tabular-nums';

export const fmtNum = (v, digits = 2) => {
  if (v == null) return '—';
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
