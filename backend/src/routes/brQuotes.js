const { Router } = require('express');
const { getBrQuotes } = require('../controllers/brQuotesController');

const router = Router();
router.get('/', getBrQuotes);

module.exports = router;
