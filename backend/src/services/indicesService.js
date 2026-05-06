const axios = require('axios');
const { logger } = require('../utils/logger');

const yahooClient = axios.create({
  baseURL: 'https://query1.finance.yahoo.com',
  timeout: 10_000,
  headers: { 'User-Agent': 'Mozilla/5.0 (FinancaOnboard/1.0)' },
});

const awesomeClient = axios.create({
  baseURL: 'https://economia.awesomeapi.com.br',
  timeout: 10_000,
});

async function fetchYahooIndex(symbol) {
  try {
    const { data } = await yahooClient.get(`/v8/finance/chart/${encodeURIComponent(symbol)}`, {
      params: { interval: '1d', range: '1d' },
    });
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose;
    const changePct = prev ? ((price - prev) / prev) * 100 : null;
    return {
      symbol,
      price,
      changePct: changePct != null ? Math.round(changePct * 100) / 100 : null,
      previousClose: prev,
      updatedAt: Date.now(),
    };
  } catch (err) {
    logger.warn(`Yahoo index ${symbol} failed`, err.message);
    return null;
  }
}

async function fetchBtcBrl() {
  try {
    const { data } = await awesomeClient.get('/last/BTC-BRL');
    const raw = data?.BTCBRL;
    if (!raw) return null;
    return {
      symbol: 'BTC',
      price: parseFloat(raw.bid),
      changePct: parseFloat(raw.pctChange),
      updatedAt: Date.now(),
    };
  } catch (err) {
    logger.warn('BTC index failed', err.message);
    return null;
  }
}

async function getMarketIndices() {
  const [ibov, sp500, btc] = await Promise.all([
    fetchYahooIndex('^BVSP'),
    fetchYahooIndex('^GSPC'),
    fetchBtcBrl(),
  ]);

  return {
    ibov: ibov ? { label: 'IBOV', price: ibov.price, changePct: ibov.changePct } : null,
    sp500: sp500 ? { label: 'S&P 500', price: sp500.price, changePct: sp500.changePct } : null,
    btc: btc ? { label: 'BTC', price: btc.price, changePct: btc.changePct } : null,
  };
}

module.exports = { getMarketIndices };
