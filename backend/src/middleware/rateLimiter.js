const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' }
});

const strictLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(10, Math.floor(env.RATE_LIMIT_MAX_REQUESTS / 4)),
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, strictLimiter };
