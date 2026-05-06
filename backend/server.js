require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./src/app');
const { env } = require('./src/config/env');
const { logger } = require('./src/utils/logger');
const { ROOMS } = require('./src/config/constants');
const { startPolygonBridge } = require('./src/websocket/polygonBridge');
const { startCalendarCron } = require('./src/services/calendarCron');
const { startBrRssPoller } = require('./src/services/brRssPoller');
const { startBrQuotesCron } = require('./src/services/brQuotesCron');
const { startCurrencyCron } = require('./src/services/currencyCron');

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST'] },
  pingInterval: 20_000,
  pingTimeout: 15_000
});

io.on('connection', (socket) => {
  logger.info(`socket connected ${socket.id}`);
  socket.join([ROOMS.NEWS, ROOMS.ALERTS, ROOMS.CALENDAR, ROOMS.QUOTES]);
  socket.emit('provider:status', {
    finnhub: env.hasFinnhub ? 'ready' : 'disabled',
    eodhd: env.hasEodhd ? 'ready' : 'disabled',
    polygon: env.hasPolygon ? 'ready' : 'disabled',
    brapi: env.hasBrapi ? 'ready' : 'no-token',
    brRss: 'polling'
  });
  socket.on('disconnect', (reason) => logger.info(`socket disconnect ${socket.id}: ${reason}`));
});

const app = createApp({ io });
httpServer.on('request', app);

startPolygonBridge(io);
startCalendarCron(io);
startBrRssPoller(io);
startBrQuotesCron(io);
startCurrencyCron(io);

httpServer.listen(env.PORT, () => {
  logger.info(`HTTP + Socket.io listening on :${env.PORT}`);
  logger.info(`CORS allowing origin: ${env.FRONTEND_URL}`);
  logger.info(`providers → finnhub:${env.hasFinnhub} eodhd:${env.hasEodhd} polygon:${env.hasPolygon}`);
});

const shutdown = (signal) => {
  logger.warn(`${signal} received — shutting down`);
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => logger.error('unhandledRejection', err));
process.on('uncaughtException', (err) => logger.error('uncaughtException', err));
