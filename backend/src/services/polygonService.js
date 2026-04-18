const WebSocket = require('ws');
const EventEmitter = require('events');
const { env } = require('../config/env');
const { logger } = require('../utils/logger');
const { ExponentialBackoff } = require('../utils/backoff');

const STATUS = { DISCONNECTED: 'disconnected', CONNECTING: 'connecting', CONNECTED: 'connected', AUTHED: 'authed' };

class PolygonClient extends EventEmitter {
  constructor({ subscriptions = ['T.*', 'N.*'] } = {}) {
    super();
    this.url = env.POLYGON_WS_URL;
    this.apiKey = env.POLYGON_API_KEY;
    this.subscriptions = subscriptions;
    this.ws = null;
    this.status = STATUS.DISCONNECTED;
    this.backoff = new ExponentialBackoff({ base: 1000, factor: 2, max: 30_000, jitter: 0.3 });
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.manuallyClosed = false;
  }

  connect() {
    if (!env.hasPolygon) {
      logger.warn('Polygon key missing — skipping WS connection');
      return;
    }
    if (this.status === STATUS.CONNECTING || this.status === STATUS.CONNECTED || this.status === STATUS.AUTHED) return;

    this.status = STATUS.CONNECTING;
    this.emit('status', this.status);
    logger.info(`Polygon WS connecting → ${this.url}`);

    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      this.status = STATUS.CONNECTED;
      this.emit('status', this.status);
      this.ws.send(JSON.stringify({ action: 'auth', params: this.apiKey }));
    });

    this.ws.on('message', (buf) => this._onMessage(buf));
    this.ws.on('error', (err) => logger.error('Polygon WS error', err.message));
    this.ws.on('close', (code, reason) => this._onClose(code, reason?.toString()));

    this._startHeartbeat();
  }

  _onMessage(buf) {
    let messages;
    try {
      messages = JSON.parse(buf.toString());
    } catch {
      return;
    }
    if (!Array.isArray(messages)) messages = [messages];

    for (const m of messages) {
      if (m.ev === 'status') {
        if (m.status === 'auth_success') {
          this.status = STATUS.AUTHED;
          this.backoff.reset();
          this.emit('status', this.status);
          logger.info('Polygon WS authenticated');
          this.ws.send(JSON.stringify({ action: 'subscribe', params: this.subscriptions.join(',') }));
        } else if (m.status === 'auth_failed') {
          logger.error('Polygon auth failed — free tier? Falling back to REST polling');
          this.emit('unauthorized');
          this.close();
        }
      } else {
        this.emit('message', m);
      }
    }
  }

  _onClose(code, reason) {
    this._stopHeartbeat();
    this.status = STATUS.DISCONNECTED;
    this.emit('status', this.status);
    logger.warn(`Polygon WS closed (${code}) ${reason || ''}`);
    if (!this.manuallyClosed) this._scheduleReconnect();
  }

  _scheduleReconnect() {
    const delay = this.backoff.next();
    logger.info(`Polygon WS reconnect in ${delay}ms`);
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try { this.ws.ping(); } catch { /* ignore */ }
      }
    }, 20_000);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  close() {
    this.manuallyClosed = true;
    this._stopHeartbeat();
    clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}

module.exports = { PolygonClient, STATUS };
