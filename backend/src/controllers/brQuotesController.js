const yahoo = require('../services/yahooQuotesService');
const { getLatestBrQuotes, refresh } = require('../services/brQuotesCron');

async function getBrQuotes(req, res, next) {
  try {
    const custom = req.query.tickers
      ? String(req.query.tickers).split(',').map((s) => s.trim()).filter(Boolean)
      : null;

    if (custom) {
      const quotes = await yahoo.getQuotesBatch(custom);
      return res.json({ count: quotes.length, tickers: custom, quotes });
    }

    let quotes = getLatestBrQuotes();
    if (!quotes.length) {
      await refresh();
      quotes = getLatestBrQuotes();
    }
    res.json({ count: quotes.length, quotes });
  } catch (err) { next(err); }
}

module.exports = { getBrQuotes };
