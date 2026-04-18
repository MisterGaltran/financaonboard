export const fmtTime = (ts) => {
  if (!ts) return '--:--:--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const fmtDateTime = (ts) => {
  if (!ts) return '--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const fmtHHMM = (ts) => {
  if (!ts) return '--:--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const impactClass = (impact) => {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'bg-bbg-red text-black';
    case 'medium': return 'bg-bbg-yellow text-black';
    default:       return 'bg-bbg-muted/40 text-bbg-amber';
  }
};

export const impactLabel = (impact) => {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'H';
    case 'medium': return 'M';
    default:       return 'L';
  }
};

export const IMPACT_BADGE_CLASS = 'inline-flex items-center justify-center w-5 h-5 text-[11px] font-black leading-none tabular-nums';

export const fmtNum = (v, digits = 2) => {
  if (v == null) return '—';
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
