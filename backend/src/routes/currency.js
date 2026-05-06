const { Router } = require('express');
const { getLatestCurrencyQuotes } = require('../services/currencyCron');
const { getAvailablePairs } = require('../services/awesomeApiService');

const router = Router();

router.get('/', (req, res) => {
  const quotes = getLatestCurrencyQuotes();
  res.json({ count: quotes.length, quotes });
});

router.get('/available', async (req, res, next) => {
  try {
    const pairs = await getAvailablePairs();
    res.json({ count: pairs.length, pairs });
  } catch (err) { next(err); }
});

module.exports = router;
