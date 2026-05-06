const { logger } = require('../utils/logger');
const { SOCKET_EVENTS, ROOMS } = require('../config/constants');
const yahoo = require('./yahooQuotesService');

const REFRESH_MS = 30_000;
const LIST_LIMIT = 50;

let latest = [];
let refreshing = false;
let timer = null;

async function refresh(io) {
  if (refreshing) return;
  refreshing = true;
  try {
    const quotes = await yahoo.getIbovComposition({ limit: LIST_LIMIT });
    if (quotes.length) {
      latest = quotes.sort((a, b) => (b.volume || 0) - (a.volume || 0));
      if (io) io.to(ROOMS.QUOTES).emit(SOCKET_EVENTS.QUOTES_BR_UPDATE, latest);
      logger.info(`BR quotes refreshed (Yahoo): ${quotes.length} symbols`);
    } else if (latest.length === 0) {
      logger.warn('BR quotes refresh returned 0');
    }
  } catch (err) {
    logger.error('BR quotes refresh failed', err.message);
  } finally {
    refreshing = false;
  }
}

function getLatestBrQuotes() { return latest; }

function startBrQuotesCron(io) {
  refresh(io);
  timer = setInterval(() => refresh(io), REFRESH_MS);
  logger.info(`BR quotes cron scheduled (Yahoo, every ${REFRESH_MS}ms)`);
}

function stopBrQuotesCron() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { startBrQuotesCron, stopBrQuotesCron, getLatestBrQuotes, refresh };
