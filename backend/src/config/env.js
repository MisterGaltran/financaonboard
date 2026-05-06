const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  EODHD_API_KEY: process.env.EODHD_API_KEY || '',

  CALENDAR_REFRESH_CRON: process.env.CALENDAR_REFRESH_CRON || '*/5 * * * *',

  BRAPI_API_KEY: process.env.BRAPI_API_KEY || '',
  BR_RSS_POLL_INTERVAL_MS: parseInt(process.env.BR_RSS_POLL_INTERVAL_MS || '90000', 10),
  BR_TICKERS: (process.env.BR_TICKERS || '').split(',').map((s) => s.trim()).filter(Boolean),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '120', 10)
};

const isPlaceholder = (v) => !v || v.startsWith('your_') || v.includes('_here');

env.hasFinnhub = !isPlaceholder(env.FINNHUB_API_KEY);
env.hasEodhd = !isPlaceholder(env.EODHD_API_KEY);
env.hasBrapi = !isPlaceholder(env.BRAPI_API_KEY);

module.exports = { env };
