const { PolygonClient } = require('../services/polygonService');
const { PolygonRestPoller } = require('../services/polygonRestPoller');
const { inferImpactFromText } = require('../utils/impact');
const { SOCKET_EVENTS, ROOMS, IMPACT } = require('../config/constants');
const { logger } = require('../utils/logger');
const { env } = require('../config/env');

function normalizePolygonNews(raw) {
  return {
    id: `polygon-${raw.id || raw.article_url || Date.now()}`,
    headline: raw.title || raw.headline || '',
    summary: raw.description || raw.summary || '',
    source: raw.publisher?.name || raw.source || 'polygon',
    url: raw.article_url || raw.url || '',
    image: raw.image_url || raw.image || '',
    category: 'general',
    datetime: new Date(raw.published_utc || Date.now()).getTime(),
    tickers: raw.tickers || [],
    keywords: raw.keywords || [],
    language: 'en',
    region: 'GLOBAL',
    impact: inferImpactFromText(raw.title || raw.headline, raw.description || raw.summary)
  };
}

function emitNews(io, item) {
  io.to(ROOMS.NEWS).emit(SOCKET_EVENTS.NEWS_NEW, item);
  if (item.impact === IMPACT.HIGH) {
    io.to(ROOMS.ALERTS).emit(SOCKET_EVENTS.ALERT_CRITICAL, {
      id: `alert-${item.id}`,
      type: 'news',
      severity: 'high',
      title: item.headline,
      message: item.summary,
      source: item.source,
      url: item.url,
      tickers: item.tickers,
      timestamp: item.datetime
    });
  }
}

function startPolygonBridge(io) {
  if (!env.hasPolygon) {
    logger.warn('Polygon bridge disabled (no API key)');
    io.emit(SOCKET_EVENTS.PROVIDER_STATUS, { polygon: 'disabled' });
    return null;
  }

  const wsClient = new PolygonClient({ subscriptions: ['N.*'] });
  let restPoller = null;

  const startRestFallback = () => {
    if (restPoller) return;
    restPoller = new PolygonRestPoller();
    restPoller.on('news', (raw) => emitNews(io, normalizePolygonNews(raw)));
    restPoller.start();
    io.emit(SOCKET_EVENTS.PROVIDER_STATUS, { polygon: 'rest-polling' });
  };

  wsClient.on('status', (status) => {
    io.emit(SOCKET_EVENTS.PROVIDER_STATUS, { polygon: status });
  });

  wsClient.on('unauthorized', () => {
    startRestFallback();
  });

  wsClient.on('message', (msg) => {
    if (msg.ev !== 'N') return;
    emitNews(io, normalizePolygonNews(msg));
  });

  wsClient.connect();
  return { wsClient, getRestPoller: () => restPoller };
}

module.exports = { startPolygonBridge };
