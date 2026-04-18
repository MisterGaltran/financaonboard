const { Router } = require('express');
const { getNews, getSentiment } = require('../controllers/newsController');

const router = Router();
router.get('/', getNews);
router.get('/sentiment/:symbol', getSentiment);

module.exports = router;
