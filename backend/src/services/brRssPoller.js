const Parser = require('rss-parser');
const crypto = require('crypto');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { SOCKET_EVENTS, ROOMS, IMPACT, BR_RSS_FEEDS } = require('../config/constants');
const { inferImpactFromText } = require('../utils/impact');

const MAX_SEEN = 800;

class BrRssPoller {
  constructor(io) {
    this.io = io;
    this.parser = new Parser({ timeout: 8_000, headers: { 'User-Agent': 'FinancaOnboard/1.0 (+local)' } });
    this.seen = new Set();
    this.seenHeadlines = new Set();
    this.timer = null;
    this.stopped = false;
    this.firstRun = true;
  }

  _idFor(item, feedName) {
    if (item.guid) return `rss-${feedName}-${item.guid}`;
    const hash = crypto.createHash('sha1').update(`${item.title || ''}${item.link || ''}`).digest('hex').slice(0, 16);
    return `rss-${feedName}-${hash}`;
  }

  _normalize(item, feedName) {
    const headline = item.title?.trim() || '';
    const summary = (item.contentSnippet || item.summary || item.content || '').replace(/\s+/g, ' ').trim().slice(0, 400);
    const published = item.isoDate ? new Date(item.isoDate).getTime() : (item.pubDate ? new Date(item.pubDate).getTime() : Date.now());
    return {
      id: this._idFor(item, feedName),
      headline,
      summary,
      source: feedName,
      url: item.link || '',
      image: item.enclosure?.url || '',
      category: 'br',
      datetime: published,
      tickers: [],
      language: 'pt',
      region: 'BR',
      impact: inferImpactFromText(headline, summary)
    };
  }

  _emit(news) {
    this.io.to(ROOMS.NEWS).emit(SOCKET_EVENTS.NEWS_NEW, news);
    if (news.impact === IMPACT.HIGH && !this.firstRun) {
      this.io.to(ROOMS.ALERTS).emit(SOCKET_EVENTS.ALERT_CRITICAL, {
        id: `alert-${news.id}`,
        type: 'news',
        severity: 'high',
        title: news.headline,
        message: news.summary,
        source: news.source,
        url: news.url,
        timestamp: news.datetime
      });
    }
  }

  async _tickOneFeed(feed) {
    try {
      const parsed = await this.parser.parseURL(feed.url);
      const items = parsed.items || [];
      let emittedCount = 0;
      for (const raw of items.slice().reverse()) {
        const news = this._normalize(raw, feed.name);
        if (this.seen.has(news.id)) continue;
        const headlineKey = news.headline.toLowerCase().trim();
        if (this.seenHeadlines.has(headlineKey)) continue;
        this.seen.add(news.id);
        this.seenHeadlines.add(headlineKey);
        this._emit(news);
        emittedCount += 1;
      }
      if (emittedCount) logger.info(`RSS ${feed.name}: ${emittedCount} new`);
    } catch (err) {
      logger.warn(`RSS ${feed.name} failed`, err.message);
    }
  }

  async _tick() {
    if (this.stopped) return;
    await Promise.allSettled(BR_RSS_FEEDS.map((f) => this._tickOneFeed(f)));
    this.firstRun = false;
    if (this.seen.size > MAX_SEEN) {
      this.seen = new Set(Array.from(this.seen).slice(-MAX_SEEN));
      this.seenHeadlines = new Set(Array.from(this.seenHeadlines).slice(-MAX_SEEN));
    }
    if (!this.stopped) this.timer = setTimeout(() => this._tick(), env.BR_RSS_POLL_INTERVAL_MS);
  }

  start() {
    logger.info(`BR RSS poller starting (${BR_RSS_FEEDS.length} feeds, every ${env.BR_RSS_POLL_INTERVAL_MS}ms)`);
    this.io.emit(SOCKET_EVENTS.PROVIDER_STATUS, { brRss: 'polling' });
    this._tick();
  }

  stop() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
  }
}

function startBrRssPoller(io) {
  const poller = new BrRssPoller(io);
  poller.start();
  return poller;
}

module.exports = { startBrRssPoller, BrRssPoller };
