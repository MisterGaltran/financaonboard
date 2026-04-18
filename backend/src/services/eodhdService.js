const axios = require('axios');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { IMPACT } = require('../config/constants');

const client = axios.create({
  baseURL: 'https://eodhd.com/api',
  timeout: 10_000
});

client.interceptors.request.use((cfg) => {
  cfg.params = { ...(cfg.params || {}), api_token: env.EODHD_API_KEY, fmt: 'json' };
  return cfg;
});

async function getEconomicCalendar({ daysAhead = 7 } = {}) {
  if (!env.hasEodhd) return [];
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + daysAhead * 86_400_000).toISOString().slice(0, 10);
  try {
    const { data } = await client.get('/economic-events', { params: { from, to, limit: 500 } });
    return (data || []).map((e, i) => ({
      id: `eodhd-${e.event}-${e.date}-${i}`,
      time: `${e.date} ${e.time || ''}`.trim(),
      country: e.country,
      event: e.event,
      actual: e.actual ?? null,
      estimate: e.estimate ?? null,
      previous: e.previous ?? null,
      unit: '',
      impact: (e.importance === 'High' ? IMPACT.HIGH : e.importance === 'Medium' ? IMPACT.MEDIUM : IMPACT.LOW)
    }));
  } catch (err) {
    logger.warn('EODHD calendar fallback failed', err.message);
    return [];
  }
}

module.exports = { getEconomicCalendar };
