// src/infrastructure/utils/logger.js
const { createLogger, format, transports, addColors } = require('winston');

// 1. Định nghĩa màu sắc cho từng level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// 2. Báo cho Winston biết bộ màu này
addColors(colors);

const logger = createLogger({
  level: 'info', // Chỉ log từ mức info trở lên
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize({ all: true }), // Áp dụng màu cho cả dòng log
    format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new transports.Console()
  ],
});

module.exports = logger;