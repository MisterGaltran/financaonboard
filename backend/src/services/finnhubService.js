const axios = require('axios');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { IMPACT } = require('../config/constants');
const { inferImpactFromText } = require('../utils/impact');

const client = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  timeout: 10_000
});

client.interceptors.request.use((cfg) => {
  cfg.params = { ...(cfg.params || {}), token: env.FINNHUB_API_KEY };
  return cfg;
});

const mapImpact = (raw) => {
  if (raw == null) return IMPACT.LOW;
  const n = Number(raw);
  if (!Number.isNaN(n)) {
    if (n >= 3) return IMPACT.HIGH;
    if (n === 2) return IMPACT.MEDIUM;
    return IMPACT.LOW;
  }
  const s = String(raw).toLowerCase();
  if (s.includes('high')) return IMPACT.HIGH;
  if (s.includes('med')) return IMPACT.MEDIUM;
  return IMPACT.LOW;
};

const toISODate = (d) => d.toISOString().slice(0, 10);

async function getEconomicCalendar({ daysAhead = 7 } = {}) {
  if (!env.hasFinnhub) {
    logger.warn('Finnhub key missing — returning empty calendar');
    return [];
  }
  const from = toISODate(new Date());
  const to = toISODate(new Date(Date.now() + daysAhead * 86_400_000));

  const { data } = await client.get('/calendar/economic', { params: { from, to } });
  const events = (data && data.economicCalendar) || [];

  return events.map((e, i) => ({
    id: `${e.event}-${e.time}-${i}`,
    time: e.time,
    country: e.country,
    event: e.event,
    actual: e.actual ?? null,
    estimate: e.estimate ?? null,
    previous: e.prev ?? null,
    unit: e.unit || '',
    impact: mapImpact(e.impact)
  }));
}

async function getMarketNews({ category = 'general', minId = 0 } = {}) {
  if (!env.hasFinnhub) {
    logger.warn('Finnhub key missing — returning empty news');
    return [];
  }
  const { data } = await client.get('/news', { params: { category, minId } });
  return (data || []).map((n) => ({
    id: String(n.id),
    headline: n.headline,
    summary: n.summary,
    source: n.source,
    url: n.url,
    image: n.image,
    category: n.category,
    datetime: n.datetime * 1000,
    sentiment: null,
    language: 'en',
    region: 'GLOBAL',
    impact: inferImpactFromText(n.headline, n.summary)
  }));
}

async function getSentimentForSymbol(symbol) {
  if (!env.hasFinnhub || !symbol) return null;
  try {
    const { data } = await client.get('/news-sentiment', { params: { symbol } });
    return data;
  } catch (err) {
    logger.warn('sentiment fetch failed', symbol, err.message);
    return null;
  }
}

module.exports = { getEconomicCalendar, getMarketNews, getSentimentForSymbol };
