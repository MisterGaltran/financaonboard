const { IMPACT } = require('../config/constants');

const HIGH_IMPACT_KEYWORDS_EN = [
  'fed', 'fomc', 'rate decision', 'rate hike', 'rate cut',
  'cpi', 'ppi', 'nfp', 'non-farm', 'nonfarm', 'unemployment',
  'gdp', 'jobless', 'inflation', 'powell', 'ecb', 'boe', 'boj',
  'war', 'sanction', 'default', 'downgrade', 'emergency'
];

const HIGH_IMPACT_KEYWORDS_PT = [
  'selic', 'copom', 'banco central', 'bc eleva', 'bc corta',
  'ipca', 'igp-m', 'igpm', 'pib', 'desemprego', 'inflação',
  'lula', 'governo', 'reforma tributária', 'reforma da previdência',
  'ibovespa despenca', 'ibovespa dispara', 'ibov despenca', 'bolsa despenca',
  'dólar dispara', 'dolar dispara', 'dólar cai forte', 'dolar cai forte',
  'rebaixamento', 'fitch', "moody's", 'moodys', 's&p global',
  'default', 'crise', 'intervenção', 'petrobras', 'congresso aprova',
  'teto de gastos', 'déficit fiscal', 'deficit fiscal', 'superávit', 'superavit',
  'impeachment', 'capital control'
];

function inferImpactFromText(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  for (const k of HIGH_IMPACT_KEYWORDS_EN) if (text.includes(k)) return IMPACT.HIGH;
  for (const k of HIGH_IMPACT_KEYWORDS_PT) if (text.includes(k)) return IMPACT.HIGH;
  return IMPACT.LOW;
}

module.exports = { inferImpactFromText, HIGH_IMPACT_KEYWORDS_EN, HIGH_IMPACT_KEYWORDS_PT };
