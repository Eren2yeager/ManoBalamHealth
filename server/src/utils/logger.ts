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

// Define log colors with background colors and font styles
const colors = {
  error: 'redBG white bold',       // Bold white text on red background
  warn: 'yellowBG white bold',   // Italic black text on yellow background
  info: 'blueBG white bold',       // Bold white text on blue background
  http: 'magentaBG white bold',     // Dim white text on magenta background
  debug: 'cyanBG white underline', // Underlined black text on cyan background
};

// Add colors to winston
winston.addColors(colors);

// Define format with timestamp
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const error = info.error;
    const errorDetails =
      error instanceof Error
        ? ` | Error: ${error.message}${error.stack ? `\n${error.stack}` : ""}`
        : error
          ? ` | Error: ${JSON.stringify(error)}`
          : "";
    return `[${info.level}] : ${info.message}${info.metadata ? ` | Metadata: ${JSON.stringify(info.metadata)}` : ""}${errorDetails}`;
  }),
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
