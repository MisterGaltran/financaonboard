const { logger } = require('../utils/logger');
const { ROOMS } = require('../config/constants');
const { getMarketIndices } = require('./indicesService');

const REFRESH_MS = 30_000;

let latest = {};
let timer = null;

async function refresh(io) {
  try {
    const indices = await getMarketIndices();
    latest = indices;
    if (io) io.to(ROOMS.QUOTES).emit('indices:update', latest);
  } catch (err) {
    logger.error('Indices refresh failed', err.message);
  }
}

function getLatestIndices() { return latest; }

function startIndicesCron(io) {
  refresh(io);
  timer = setInterval(() => refresh(io), REFRESH_MS);
  logger.info(`Indices cron scheduled (every ${REFRESH_MS}ms)`);
}

function stopIndicesCron() {
  if (timer) { clearInterval(timer); timer = null; }
}

module.exports = { startIndicesCron, stopIndicesCron, getLatestIndices };
