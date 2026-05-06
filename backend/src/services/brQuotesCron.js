const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { SOCKET_EVENTS, ROOMS } = require('../config/constants');
const brapi = require('./brapiService');

const REFRESH_MS = env.hasBrapi ? 30_000 : 120_000;
const LIST_LIMIT = 100;

let latest = [];
let refreshing = false;
let timer = null;

async function refresh(io) {
  if (refreshing) return;
  refreshing = true;
  try {
    let quotes = await brapi.getIbovList({ limit: LIST_LIMIT });
    // Fallback: if list endpoint is rate-limited, fetch default tickers individually
    if (!quotes.length && latest.length === 0) {
      logger.info('BR list empty — falling back to default tickers');
      quotes = await brapi.getQuotes(brapi.getWatchlist());
    }
    if (quotes.length) {
      latest = quotes;
      if (io) io.to(ROOMS.QUOTES).emit(SOCKET_EVENTS.QUOTES_BR_UPDATE, latest);
      logger.info(`BR quotes refreshed: ${quotes.length} symbols`);
    } else if (latest.length === 0) {
      logger.warn('BR quotes refresh returned 0 — no cache available');
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
  logger.info(`BR quotes cron scheduled (every ${REFRESH_MS}ms)`);
}

function stopBrQuotesCron() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { startBrQuotesCron, stopBrQuotesCron, getLatestBrQuotes, refresh };
