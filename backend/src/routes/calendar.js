const { Router } = require('express');
const { getCalendar } = require('../controllers/calendarController');

const router = Router();
router.get('/', getCalendar);

module.exports = router;
