// src/utils/logger.utils.ts

import winston from 'winston';
import { env } from '../config/env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define format with timestamp
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}] : ${info.message}${info.metadata ? ` | Metadata: ${JSON.stringify(info.metadata)}` : ''}`,
  ),
);

// Define transports
const transports = [
  new winston.transports.Console(),
];

// Create logger
const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { 
    metadata: { 
      message: error.message, 
      stack: error.stack 
    } 
  });
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection', { 
    metadata: { reason } 
  });
  process.exit(1);
});

export { logger };
