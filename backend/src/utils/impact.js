const { IMPACT } = require('../config/constants');

const HIGH_IMPACT_KEYWORDS_EN = [
  'fed ', 'fomc', 'rate decision', 'rate hike', 'rate cut',
  'cpi ', 'ppi ', 'nfp', 'non-farm', 'nonfarm', 'unemployment rate',
  'gdp ', 'jobless claims', 'inflation rate', 'powell', 'ecb ', 'boe ', 'boj ',
  'trade war', 'sanction', 'sovereign default', 'credit downgrade', 'financial emergency',
  'recession', 'soft landing', 'hard landing', 'liquidity crisis', 'banking crisis',
  'tariff', 'trade deal', 'oil shock', 'opec ', 'opec+',
  'geopolitical', 'war ', 'invasion', 'cease-fire', 'ceasefire',
  'sec charges', 'sec sues', 'antitrust', 'merger blocked',
  'plummet', 'plunge', 'soar', 'crash', 'rally',
  'beats estimates', 'misses estimates', 'guidance cut', 'guidance raise',
  'bankruptcy', 'chapter 11', 'default on debt', 'restructuring'
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
  'ibovespa sobe', 'ibovespa cai', 'bolsa sobe', 'bolsa cai',
  'dólar dispara', 'dolar dispara', 'dólar cai forte', 'dolar cai forte',
  'dólar bate', 'dolar bate', 'câmbio dispara', 'cambio dispara', 'dólar fecha', 'dolar fecha',
  'rebaixamento de nota', 'fitch rebaixa', "moody's rebaixa", 'moodys rebaixa', 's&p rebaixa',
  'crise fiscal', 'crise econômica', 'crise economica', 'crise financeira',
  'intervenção cambial', 'intervencao cambial',
  'petrobras reajust', 'petrobras anuncia', 'petrobras corta', 'petrobras eleva',
  'congresso aprova', 'senado aprova', 'câmara aprova', 'camara aprova',
  'teto de gastos', 'arcabouço fiscal', 'arcabouco fiscal',
  'déficit fiscal', 'deficit fiscal', 'superávit primário', 'superavit primario',
  'impeachment', 'risco país', 'risco pais',
  'recessão', 'recessao',
  'tarifa', 'tarifaço', 'tarifaco',
  'guerra', 'invasão', 'invasao', 'cessar-fogo',
  'falência', 'falencia', 'recuperação judicial', 'recuperacao judicial',
  'lava jato', 'cpi ', 'denúncia', 'denuncia',
  'lula anuncia', 'haddad anuncia', 'campos neto'
];

const MEDIUM_IMPACT_KEYWORDS_EN = [
  'earnings', 'quarterly', 'q1 ', 'q2 ', 'q3 ', 'q4 ',
  'revenue', 'net income', 'profit', 'loss',
  'merger', 'acquires', 'acquisition', 'ipo ', 'spin-off',
  'lawsuit', 'investigation', 'probe', 'fine ', 'settlement',
  'ceo ', 'cfo ', 'resignation', 'steps down', 'appointed', 'named',
  'layoffs', 'job cuts', 'hiring freeze', 'restructuring',
  'guidance', 'forecast', 'outlook',
  'dividend', 'buyback', 'share repurchase',
  'treasury yield', 'bond yield', 'crude oil', 'gold price', 'btc price',
  'pmi ', 'ism ', 'retail sales', 'consumer confidence', 'industrial production',
  'fed minutes', 'beige book', 'dot plot',
  'china ', 'europe ', 'japan ', 'india ',
  'apple', 'microsoft', 'nvidia', 'tesla', 'alphabet', 'google', 'amazon', 'meta',
  'jpmorgan', 'goldman', 'morgan stanley', 'wells fargo', 'bank of america'
];

const MEDIUM_IMPACT_KEYWORDS_PT = [
  'balanço', 'balanco', 'lucro líquido', 'lucro liquido', 'prejuízo', 'prejuizo',
  'receita', 'ebitda', 'dividendo', 'jcp', 'juros sobre capital',
  'fusão', 'fusao', 'aquisição', 'aquisicao', 'joint venture',
  'oferta pública', 'oferta publica', 'follow-on', 'tender offer',
  'abertura de capital', 'fechamento de capital', 'desinvestimento',
  'demissões', 'demissoes', 'corte de pessoal', 'plano de demissão',
  'guidance', 'projeção', 'projecao', 'orientação financeira',
  'recompra de ações', 'recompra de acoes', 'programa de recompra',
  'cvm ', 'b3 anuncia', 'oferta de ações', 'oferta de acoes',
  'rating', 'classificação de risco', 'classificacao de risco',
  'mp ', 'medida provisória', 'medida provisoria',
  'reforma ministerial', 'reforma administrativa',
  'investigação', 'investigacao', 'pf prende', 'operação', 'operacao',
  'multa', 'acordo de leniência', 'acordo de leniencia',
  'china ', 'europa ', 'estados unidos', 'eua ',
  'vale ', 'petrobras', 'itaú', 'itau', 'bradesco', 'banco do brasil', 'santander',
  'eletrobras', 'ambev', 'jbs', 'magazine luiza', 'magalu', 'b3 ',
  'pmi ', 'ipa-m', 'inpc',
  'reservas internacionais', 'balança comercial', 'balanca comercial',
  'ata do copom', 'relatório focus', 'relatorio focus',
  'crédito imobiliário', 'credito imobiliario', 'poupança', 'poupanca',
  'desemprego', 'caged', 'novo emprego', 'criação de vagas', 'criacao de vagas',
  'reajuste', 'aumento salarial', 'salário mínimo', 'salario minimo'
];

function inferImpactFromText(title = '', summary = '') {
  const text = ` ${title} ${summary} `.toLowerCase();
  for (const k of HIGH_IMPACT_KEYWORDS_EN) if (text.includes(k)) return IMPACT.HIGH;
  for (const k of HIGH_IMPACT_KEYWORDS_PT) if (text.includes(k)) return IMPACT.HIGH;
  for (const k of MEDIUM_IMPACT_KEYWORDS_EN) if (text.includes(k)) return IMPACT.MEDIUM;
  for (const k of MEDIUM_IMPACT_KEYWORDS_PT) if (text.includes(k)) return IMPACT.MEDIUM;
  return IMPACT.LOW;
}

module.exports = {
  inferImpactFromText,
  HIGH_IMPACT_KEYWORDS_EN,
  HIGH_IMPACT_KEYWORDS_PT,
  MEDIUM_IMPACT_KEYWORDS_EN,
  MEDIUM_IMPACT_KEYWORDS_PT
};
