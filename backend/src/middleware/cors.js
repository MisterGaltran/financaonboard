const cors = require('cors');
const { env } = require('../config/env');

const corsMiddleware = cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false,
  maxAge: 86400
});

module.exports = { corsMiddleware };
