const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor(label) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, label, stack }) => {
          const stackTrace = stack ? `\n${stack}` : '';
          return `[${timestamp}] [${label}] ${level.toUpperCase()}: ${message}${stackTrace}`;
        })
      ),
      defaultMeta: { label },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, label }) => {
              return `[${label}] ${level}: ${message}`;
            })
          )
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error'
        }),
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log')
        })
      ]
    });
  }

  info(message) {
    this.logger.info(message);
  }

  error(message, error) {
    this.logger.error(`${message} ${error ? error.message : ''}`, { stack: error?.stack });
  }

  warn(message) {
    this.logger.warn(message);
  }

  debug(message) {
    this.logger.debug(message);
  }
}

module.exports = Logger;
