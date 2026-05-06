module.exports = {
  SOCKET_EVENTS: {
    NEWS_NEW: 'news:new',
    NEWS_SNAPSHOT: 'news:snapshot',
    CALENDAR_UPDATE: 'calendar:update',
    QUOTES_BR_UPDATE: 'quotes:br:update',
    ALERT_CRITICAL: 'alert:critical',
    PROVIDER_STATUS: 'provider:status'
  },
  ROOMS: {
    NEWS: 'news',
    ALERTS: 'alerts',
    CALENDAR: 'calendar',
    QUOTES: 'quotes'
  },
  IMPACT: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  },
  DEFAULT_BR_TICKERS: [
    '^BVSP', 'PETR4', 'VALE3', 'ITUB4', 'BBDC4',
    'BBAS3', 'ABEV3', 'MGLU3', 'WEGE3', 'B3SA3',
    'RENT3', 'RAIL3', 'SUZB3', 'PRIO3'
  ],
  BR_RSS_FEEDS: [
    { name: 'InfoMoney',          url: 'https://www.infomoney.com.br/feed/' },
    { name: 'InfoMoney Mercados', url: 'https://www.infomoney.com.br/mercados/feed/' },
    { name: 'G1 Economia',        url: 'https://g1.globo.com/rss/g1/economia/' },
    { name: 'Money Times',        url: 'https://www.moneytimes.com.br/feed/' },
    { name: 'Brazil Journal',     url: 'https://braziljournal.com/feed/' },
    { name: 'Exame',              url: 'https://exame.com/feed/' },
    { name: 'Folha Mercado',      url: 'https://feeds.folha.uol.com.br/mercado/rss091.xml' },
    { name: 'Seu Dinheiro',       url: 'https://www.seudinheiro.com/feed/' },
    { name: 'Suno Notícias',      url: 'https://www.suno.com.br/noticias/feed/' },
    { name: 'NeoFeed',            url: 'https://neofeed.com.br/feed/' },
    { name: 'E-Investidor',       url: 'https://einvestidor.estadao.com.br/feed/' },
    { name: 'Valor Econômico',   url: 'https://pox.globo.com/rss/valor/' },
    { name: 'Valor Finanças',    url: 'https://pox.globo.com/rss/valor/financas/' },
    { name: 'Valor Empresas',    url: 'https://pox.globo.com/rss/valor/empresas/' },
    { name: 'Investing.com BR',  url: 'https://br.investing.com/rss/news.rss' },
    { name: 'Agência Brasil',    url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml' },
    { name: 'Banco Central',     url: 'https://www.bcb.gov.br/api/feed/sitebcb/sitefeeds/noticias' }
  ]
};
