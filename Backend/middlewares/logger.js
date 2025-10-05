const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

exports.errorLogger = (error, req) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req?.originalUrl,
    method: req?.method,
    body: req?.body
  });
};

exports.requestLogger = (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });
  next();
};