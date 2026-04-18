const { SOCKET_EVENTS, ROOMS } = require('../config/constants');

function makeDebugController(io) {
  return {
    fireAlert(req, res) {
      const alert = {
        id: `debug-${Date.now()}`,
        type: req.body.type || 'news',
        severity: 'high',
        title: req.body.title || 'TEST — High impact alert',
        message: req.body.message || 'This is a manually fired debug alert.',
        timestamp: Date.now()
      };
      io.to(ROOMS.ALERTS).emit(SOCKET_EVENTS.ALERT_CRITICAL, alert);
      res.json({ ok: true, alert });
    },
    fireNews(req, res) {
      const item = {
        id: `debug-news-${Date.now()}`,
        headline: req.body.headline || 'DEBUG headline',
        summary: req.body.summary || '',
        source: 'debug',
        url: '',
        image: '',
        category: 'general',
        datetime: Date.now(),
        impact: req.body.impact || 'low'
      };
      io.to(ROOMS.NEWS).emit(SOCKET_EVENTS.NEWS_NEW, item);
      if (item.impact === 'high') {
        io.to(ROOMS.ALERTS).emit(SOCKET_EVENTS.ALERT_CRITICAL, {
          id: `alert-${item.id}`,
          type: 'news',
          severity: 'high',
          title: item.headline,
          message: item.summary,
          timestamp: item.datetime
        });
      }
      res.json({ ok: true, item });
    }
  };
}

module.exports = { makeDebugController };
