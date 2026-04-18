class ExponentialBackoff {
  constructor({ base = 1000, factor = 2, max = 30_000, jitter = 0.3 } = {}) {
    this.base = base;
    this.factor = factor;
    this.max = max;
    this.jitter = jitter;
    this.attempt = 0;
  }

  next() {
    const exp = Math.min(this.max, this.base * Math.pow(this.factor, this.attempt));
    const rand = 1 + (Math.random() * 2 - 1) * this.jitter;
    this.attempt += 1;
    return Math.max(0, Math.round(exp * rand));
  }

  reset() {
    this.attempt = 0;
  }
}

module.exports = { ExponentialBackoff };
