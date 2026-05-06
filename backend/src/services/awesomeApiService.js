const axios = require('axios');
const { logger } = require('../utils/logger');

const client = axios.create({
  baseURL: 'https://economia.awesomeapi.com.br',
  timeout: 10_000,
});

// Default pairs to fetch
const DEFAULT_PAIRS = [
  'USD-BRL', 'EUR-BRL', 'GBP-BRL',
  'BTC-BRL', 'ETH-BRL',
];

function normalize(pair, raw) {
  const bid = parseFloat(raw.bid);
  const pctChange = parseFloat(raw.pctChange);
  const high = parseFloat(raw.high);
  const low = parseFloat(raw.low);
  const ts = raw.timestamp ? parseInt(raw.timestamp, 10) * 1000 : Date.now();

  return {
    symbol: pair.replace('-', ''),          // USDBRL
    pairCode: pair,                         // USD-BRL
    name: raw.name || pair,                 // Dólar Americano/Real Brasileiro
    price: bid,
    changePct: isNaN(pctChange) ? null : pctChange,
    high: isNaN(high) ? null : high,
    low: isNaN(low) ? null : low,
    volume: null,
    updatedAt: ts,
    currency: 'BRL',
    assetType: pair.includes('BTC') || pair.includes('ETH') || pair.includes('XRP') ||
               pair.includes('DOGE') || pair.includes('LTC') || pair.includes('SOL')
               ? 'crypto' : 'currency',
  };
}

async function getCurrencyQuotes(pairs) {
  const requested = Array.isArray(pairs) && pairs.length ? pairs : DEFAULT_PAIRS;
  const joined = requested.join(',');
  try {
    const { data } = await client.get(`/last/${joined}`);
    return Object.entries(data).map(([key, raw]) => {
      const pair = key.replace(/(\w+)(\w{3})$/, '$1-$2');
      // key comes as "USDBRL", we need "USD-BRL"
      const actualPair = requested.find(p => p.replace('-', '') === key) || pair;
      return normalize(actualPair, raw);
    });
  } catch (err) {
    logger.warn('AwesomeAPI fetch failed', err.message);
    return [];
  }
}

async function getAvailablePairs() {
  try {
    const { data } = await client.get('/json/available');
    return Object.entries(data)
      .filter(([k]) => k.endsWith('-BRL'))
      .map(([code, name]) => ({ code, name }));
  } catch (err) {
    logger.warn('AwesomeAPI available pairs failed', err.message);
    return [];
  }
}

module.exports = { getCurrencyQuotes, getAvailablePairs, DEFAULT_PAIRS };
