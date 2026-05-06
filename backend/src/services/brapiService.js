const axios = require('axios');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { DEFAULT_BR_TICKERS } = require('../config/constants');

const client = axios.create({
  baseURL: 'https://brapi.dev/api',
  timeout: 10_000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (FinancaOnboard/1.0)',
    'Accept': 'application/json'
  }
});

if (!env.hasBrapi) {
  logger.warn('BRAPI_API_KEY missing — free requests limited (~3/min). Register free at https://brapi.dev/dashboard');
}

client.interceptors.request.use((cfg) => {
  if (env.hasBrapi) {
    cfg.params = { ...(cfg.params || {}), token: env.BRAPI_API_KEY };
  }
  return cfg;
});

function getWatchlist() {
  const base = env.BR_TICKERS.length ? env.BR_TICKERS : DEFAULT_BR_TICKERS;
  if (env.hasBrapi) return base;
  return base.filter((t) => !t.startsWith('^'));
}

const normalize = (r) => ({
  symbol: r.symbol,
  name: r.shortName || r.longName || r.symbol,
  price: r.regularMarketPrice ?? null,
  change: r.regularMarketChange ?? null,
  changePct: r.regularMarketChangePercent ?? null,
  open: r.regularMarketOpen ?? null,
  high: r.regularMarketDayHigh ?? null,
  low: r.regularMarketDayLow ?? null,
  previousClose: r.regularMarketPreviousClose ?? null,
  volume: r.regularMarketVolume ?? null,
  updatedAt: r.regularMarketTime ? new Date(r.regularMarketTime).getTime() : Date.now(),
  currency: r.currency || 'BRL',
  logo: r.logourl || null
});

async function _fetchBatch(batch) {
  const path = batch.map((t) => encodeURIComponent(t)).join(',');
  const { data } = await client.get(`/quote/${path}`);
  return (data?.results || []).map(normalize);
}

async function getQuotes(tickers) {
  const requested = Array.isArray(tickers) && tickers.length ? tickers : getWatchlist();
  const effective = env.hasBrapi ? requested : requested.filter((t) => !t.startsWith('^'));
  if (!effective.length) return [];
  const chunkSize = env.hasBrapi ? 1 : 2;
  const interBatchDelayMs = env.hasBrapi ? 120 : 600;
  const chunks = [];
  for (let i = 0; i < effective.length; i += chunkSize) chunks.push(effective.slice(i, i + chunkSize));

  const all = [];
  for (let i = 0; i < chunks.length; i += 1) {
    try {
      const items = await _fetchBatch(chunks[i]);
      all.push(...items);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      logger.warn('BRAPI batch failed', chunks[i].join(','), err.response?.status || '', msg);
    }
    if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, interBatchDelayMs));
  }
  return all;
}

const IBOV_TICKER_REGEX = /^[A-Z]{4}(3|4|5|6|11)$/;

async function getIbovList({ limit = 100 } = {}) {
  try {
    const { data } = await client.get('/quote/list');
    const stocks = (data?.stocks || [])
      .filter((s) => IBOV_TICKER_REGEX.test(s.stock))
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, limit);
    return stocks.map((s) => ({
      symbol: s.stock,
      name: s.name || s.stock,
      price: s.close ?? null,
      change: null,
      changePct: typeof s.change === 'number' ? s.change : null,
      volume: s.volume ?? null,
      marketCap: s.market_cap ?? null,
      sector: s.sector || '',
      logo: s.logo || null,
      updatedAt: Date.now(),
      currency: 'BRL'
    }));
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    logger.warn('BRAPI list failed', err.response?.status || '', msg);
    return [];
  }
}

module.exports = { getQuotes, getWatchlist, getIbovList };
