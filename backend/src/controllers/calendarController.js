const { getLatestCalendar, refreshCalendar } = require('../services/calendarCron');

async function getCalendar(req, res, next) {
  try {
    let events = getLatestCalendar();
    if (!events.length) events = await refreshCalendar();
    res.json({ count: events.length, events });
  } catch (err) { next(err); }
}

module.exports = { getCalendar };
