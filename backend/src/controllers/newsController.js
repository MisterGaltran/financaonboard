const finnhub = require('../services/finnhubService');

async function getNews(req, res, next) {
  try {
    const category = req.query.category || 'general';
    const news = await finnhub.getMarketNews({ category });
    res.json({ count: news.length, news });
  } catch (err) { next(err); }
}

async function getSentiment(req, res, next) {
  try {
    const { symbol } = req.params;
    const data = await finnhub.getSentimentForSymbol(symbol);
    res.json(data || {});
  } catch (err) { next(err); }
}

module.exports = { getNews, getSentiment };
