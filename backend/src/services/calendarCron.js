const cron = require('node-cron');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { SOCKET_EVENTS, ROOMS } = require('../config/constants');
const finnhub = require('./finnhubService');
const eodhd = require('./eodhdService');

let latestCalendar = [];

async function refreshCalendar() {
  let events = [];
  try {
    events = await finnhub.getEconomicCalendar();
    if (!events.length && env.hasEodhd) {
      logger.info('Finnhub empty — trying EODHD fallback');
      events = await eodhd.getEconomicCalendar();
    }
  } catch (err) {
    logger.error('calendar refresh failed', err.message);
    if (env.hasEodhd) {
      try { events = await eodhd.getEconomicCalendar(); } catch (e) { logger.error('EODHD fallback failed', e.message); }
    }
  }
  latestCalendar = events;
  return events;
}

function getLatestCalendar() { return latestCalendar; }

function startCalendarCron(io) {
  refreshCalendar().then((events) => {
    io.to(ROOMS.CALENDAR).emit(SOCKET_EVENTS.CALENDAR_UPDATE, events);
    logger.info(`calendar initial load: ${events.length} events`);
  });

  cron.schedule(env.CALENDAR_REFRESH_CRON, async () => {
    const events = await refreshCalendar();
    io.to(ROOMS.CALENDAR).emit(SOCKET_EVENTS.CALENDAR_UPDATE, events);
    logger.info(`calendar refreshed: ${events.length} events`);
  });

  logger.info(`calendar cron scheduled: ${env.CALENDAR_REFRESH_CRON}`);
}

module.exports = { startCalendarCron, refreshCalendar, getLatestCalendar };
