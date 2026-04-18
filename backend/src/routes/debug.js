const { Router } = require('express');
const { makeDebugController } = require('../controllers/debugController');

function makeDebugRouter(io) {
  const router = Router();
  const ctrl = makeDebugController(io);
  router.post('/alert', ctrl.fireAlert);
  router.post('/news', ctrl.fireNews);
  return router;
}

module.exports = { makeDebugRouter };
