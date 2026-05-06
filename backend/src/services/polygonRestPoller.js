const axios = require('axios');
const EventEmitter = require('events');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');

const POLL_INTERVAL_MS = 10_000;
const MAX_SEEN = 500;

class PolygonRestPoller extends EventEmitter {
  constructor() {
    super();
    this.client = axios.create({
      baseURL: 'https://api.massive.com',
      timeout: 10_000
    });
    this.client.interceptors.request.use((cfg) => {
      cfg.params = { ...(cfg.params || {}), apiKey: env.POLYGON_API_KEY };
      return cfg;
    });
    this.seen = new Set();
    this.timer = null;
    this.stopped = false;
    this.lastPublishedAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  }

  async _tick() {
    if (this.stopped) return;
    try {
      const { data } = await this.client.get('/v2/reference/news', {
        params: {
          order: 'desc',
          limit: 50,
          'published_utc.gte': this.lastPublishedAt
        }
      });
      const results = data?.results || [];
      let newest = this.lastPublishedAt;
      const fresh = [];
      for (const n of results) {
        if (this.seen.has(n.id)) continue;
        this.seen.add(n.id);
        fresh.push(n);
        if (n.published_utc > newest) newest = n.published_utc;
      }
      if (newest !== this.lastPublishedAt) this.lastPublishedAt = newest;

      if (this.seen.size > MAX_SEEN) {
        const arr = Array.from(this.seen).slice(-MAX_SEEN);
        this.seen = new Set(arr);
      }

      for (const item of fresh.reverse()) this.emit('news', item);
    } catch (err) {
      logger.warn('Polygon REST poll failed', err.response?.status || err.message);
    } finally {
      if (!this.stopped) this.timer = setTimeout(() => this._tick(), POLL_INTERVAL_MS);
    }
  }

  start() {
    if (!env.hasPolygon) {
      logger.warn('Polygon REST poller skipped (no key)');
      return;
    }
    this.stopped = false;
    logger.info(`Polygon REST poller starting (interval ${POLL_INTERVAL_MS}ms)`);
    this._tick();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
  }
}

module.exports = { PolygonRestPoller };
