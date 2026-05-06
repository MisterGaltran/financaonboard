const { logger } = require('../utils/logger');
const { SOCKET_EVENTS, ROOMS } = require('../config/constants');
const { getCurrencyQuotes, DEFAULT_PAIRS } = require('./awesomeApiService');

const REFRESH_MS = 30_000;

let latest = [];
let timer = null;

async function refresh(io) {
  try {
    const quotes = await getCurrencyQuotes(DEFAULT_PAIRS);
    if (quotes.length) {
      latest = quotes;
      if (io) io.to(ROOMS.QUOTES).emit('quotes:currency:update', latest);
      logger.info(`Currency quotes refreshed: ${quotes.length} pairs`);
    }
  } catch (err) {
    logger.error('Currency refresh failed', err.message);
  }
}

function getLatestCurrencyQuotes() { return latest; }

function startCurrencyCron(io) {
  refresh(io);
  timer = setInterval(() => refresh(io), REFRESH_MS);
  logger.info(`Currency cron scheduled (every ${REFRESH_MS}ms)`);
}

function stopCurrencyCron() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { startCurrencyCron, stopCurrencyCron, getLatestCurrencyQuotes, refresh };
