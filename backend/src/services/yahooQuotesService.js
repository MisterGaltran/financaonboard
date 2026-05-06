const axios = require('axios');
const { logger } = require('../utils/logger');

const client = axios.create({
  baseURL: 'https://query1.finance.yahoo.com',
  timeout: 10_000,
  headers: { 'User-Agent': 'Mozilla/5.0 (FinancaOnboard/1.0)' },
});

const IBOV_TICKER_REGEX = /^[A-Z]{4}(3|4|5|6|11)$/;

async function fetchQuote(yahooSymbol) {
  const { data } = await client.get(`/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`, {
    params: { interval: '1d', range: '1d' },
  });
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) return null;

  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose || meta.previousClose;
  const changePct = prev ? ((price - prev) / prev) * 100 : null;
  const symbol = yahooSymbol.replace('.SA', '');

  return {
    symbol,
    name: meta.shortName || meta.longName || symbol,
    price,
    change: prev ? price - prev : null,
    changePct: changePct != null ? Math.round(changePct * 100) / 100 : null,
    open: meta.regularMarketOpen ?? null,
    high: meta.regularMarketDayHigh ?? null,
    low: meta.regularMarketDayLow ?? null,
    previousClose: prev ?? null,
    volume: meta.regularMarketVolume ?? null,
    updatedAt: Date.now(),
    currency: meta.currency || 'BRL',
  };
}

async function getQuotesBatch(symbols) {
  const results = [];
  // Fetch in parallel batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map((s) => fetchQuote(s.includes('.') ? s : s + '.SA'))
    );
    for (const r of batchResults) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    }
    if (i + batchSize < symbols.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return results;
}

async function getIbovComposition({ limit = 50 } = {}) {
  // Use a curated list of top IBOV stocks by liquidity
  const TOP_IBOV = [
    'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'ABEV3', 'WEGE3', 'B3SA3',
    'RENT3', 'RAIL3', 'SUZB3', 'PRIO3', 'MGLU3', 'ITSA4', 'CMIG4', 'GGBR4',
    'HAPV3', 'LREN3', 'EQTL3', 'RADL3', 'CSNA3', 'BBSE3', 'TOTS3', 'RDOR3',
    'ENEV3', 'BPAC11', 'CSAN3', 'JHSF3', 'SBSP3', 'KLBN4', 'USIM5', 'CYRE3',
    'MRVE3', 'ASAI3', 'COGN3', 'CVCB3', 'CPLE3', 'POMO4', 'GOAU4', 'YDUQ3',
    'VAMO3', 'ALOS3', 'PETR3', 'BEEF3', 'AZUL4', 'VIVT3', 'JBSS3', 'BRFS3',
    'EMBR3', 'NTCO3',
  ];
  const tickers = TOP_IBOV.slice(0, limit);
  return getQuotesBatch(tickers);
}

module.exports = { getQuotesBatch, getIbovComposition, fetchQuote };
