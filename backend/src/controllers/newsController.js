const finnhub = require('../services/finnhubService');
const { getRecentBrNews } = require('../services/brRssPoller');

async function getNews(req, res, next) {
  try {
    const category = req.query.category || 'general';
    const [globalNews, brNews] = await Promise.all([
      finnhub.getMarketNews({ category }).catch(() => []),
      Promise.resolve(getRecentBrNews(100))
    ]);
    const all = [...globalNews, ...brNews]
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, 200);
    res.json({ count: all.length, news: all });
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
