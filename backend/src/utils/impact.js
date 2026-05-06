const { IMPACT } = require('../config/constants');

const HIGH_IMPACT_KEYWORDS_EN = [
  'fed ', 'fomc', 'rate decision', 'rate hike', 'rate cut',
  'cpi ', 'ppi ', 'nfp', 'non-farm', 'nonfarm', 'unemployment rate',
  'gdp ', 'jobless claims', 'inflation rate', 'powell', 'ecb ', 'boe ', 'boj ',
  'trade war', 'sanction', 'sovereign default', 'credit downgrade', 'financial emergency'
];

const HIGH_IMPACT_KEYWORDS_PT = [
  'selic', 'copom', 'banco central do brasil', 'bcb ',
  'bc eleva', 'bc corta', 'bc mantém', 'bc mantem',
  'ipca', 'igp-m', 'igpm',
  'pib do brasil', 'pib brasileiro', 'pib recua', 'pib avança', 'pib avanca',
  'taxa de desemprego',
  'inflação oficial', 'inflação acumul', 'meta de inflação',
  'reforma tributária', 'reforma tributaria', 'reforma da previdência',
  'ibovespa despenca', 'ibovespa dispara', 'ibov despenca', 'bolsa despenca', 'bolsa dispara',
  'dólar dispara', 'dolar dispara', 'dólar cai forte', 'dolar cai forte',
  'dólar bate', 'dolar bate', 'câmbio dispara', 'cambio dispara',
  'rebaixamento de nota', 'fitch rebaixa', "moody's rebaixa", 'moodys rebaixa', 's&p rebaixa',
  'crise fiscal', 'crise econômica', 'crise economica', 'crise financeira',
  'intervenção cambial', 'intervencao cambial',
  'petrobras reajust', 'petrobras anuncia',
  'congresso aprova', 'senado aprova', 'câmara aprova', 'camara aprova',
  'teto de gastos', 'arcabouço fiscal', 'arcabouco fiscal',
  'déficit fiscal', 'deficit fiscal', 'superávit primário', 'superavit primario',
  'impeachment', 'risco país', 'risco pais'
];

function inferImpactFromText(title = '', summary = '') {
  const text = ` ${title} ${summary} `.toLowerCase();
  for (const k of HIGH_IMPACT_KEYWORDS_EN) if (text.includes(k)) return IMPACT.HIGH;
  for (const k of HIGH_IMPACT_KEYWORDS_PT) if (text.includes(k)) return IMPACT.HIGH;
  return IMPACT.LOW;
}

module.exports = { inferImpactFromText, HIGH_IMPACT_KEYWORDS_EN, HIGH_IMPACT_KEYWORDS_PT };
