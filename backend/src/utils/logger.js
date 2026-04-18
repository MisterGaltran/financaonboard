const ts = () => new Date().toISOString();

const fmt = (level, args) => {
  const parts = args.map((a) => (a instanceof Error ? `${a.message}\n${a.stack}` : typeof a === 'object' ? JSON.stringify(a) : String(a)));
  return `[${ts()}] ${level} ${parts.join(' ')}`;
};

const logger = {
  info: (...a) => console.log(fmt('INFO ', a)),
  warn: (...a) => console.warn(fmt('WARN ', a)),
  error: (...a) => console.error(fmt('ERROR', a)),
  debug: (...a) => process.env.NODE_ENV !== 'production' && console.log(fmt('DEBUG', a))
};

module.exports = { logger };
