const { logger } = require('../utils/logger');

const notFound = (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
};

const errorHandler = (err, req, res, _next) => {
  logger.error(`${req.method} ${req.path}`, err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.publicMessage || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message })
  });
};

module.exports = { notFound, errorHandler };
