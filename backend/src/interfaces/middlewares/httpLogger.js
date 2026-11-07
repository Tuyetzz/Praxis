// src/interfaces/middlewares/httpLogger.js
const morgan = require('morgan');
const logger = require('../../infrastructure/utils/logger');

const httpLogger = morgan((tokens, req, res) => {
  const status = Number(tokens.status(req, res));
  
  const statusColor = 
    status >= 500 ? '\x1b[31m' : 
    status >= 400 ? '\x1b[33m' : 
    status >= 300 ? '\x1b[36m' : 
    '\x1b[32m';             

  const resetColor = '\x1b[0m';

  const logMessage = [
    tokens.method(req, res),
    tokens.url(req, res),
    `${statusColor}${status}${resetColor}`, 
    tokens['response-time'](req, res) + ' ms',
    '-',
    tokens.res(req, res, 'content-length')
  ].join(' ');

  if (status >= 500) {
    logger.error(logMessage);
  } else if (status >= 400) {
    logger.warn(logMessage);  
  } else {
    logger.info(logMessage); 
  }

  return null;
});

module.exports = httpLogger;