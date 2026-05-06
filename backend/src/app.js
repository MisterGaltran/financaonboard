const express = require('express');
const helmet = require('helmet');
const { corsMiddleware } = require('./middleware/cors');
const { apiLimiter, strictLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const calendarRoutes = require('./routes/calendar');
const newsRoutes = require('./routes/news');
const brQuotesRoutes = require('./routes/brQuotes');
const currencyRoutes = require('./routes/currency');
const { makeDebugRouter } = require('./routes/debug');
const { env } = require('./config/env');

function createApp({ io }) {
  const app = express();

  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (req, res) => {
    res.json({
      ok: true,
      uptime: process.uptime(),
      providers: {
        finnhub: env.hasFinnhub,
        eodhd: env.hasEodhd,
        polygon: env.hasPolygon,
        brapi: env.hasBrapi
      }
    });
  });

  app.use('/api/calendar', apiLimiter, calendarRoutes);
  app.use('/api/news', apiLimiter, newsRoutes);
  app.use('/api/quotes/br', apiLimiter, brQuotesRoutes);
  app.use('/api/quotes/currency', apiLimiter, currencyRoutes);
  app.use('/api/debug', strictLimiter, makeDebugRouter(io));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
