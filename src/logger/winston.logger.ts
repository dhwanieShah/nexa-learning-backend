// logger.ts
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
const logOnlyError = process.env.LOG_ONLY_ERROR === 'true';

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: 'logs/%DATE%-application.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '3d', // Keep logs for the last 3 days
  maxSize: '20m',
  zippedArchive: true,
  level: logOnlyError ? 'error' : 'info', // Log only errors if LOG_ONLY_ERROR is true
});

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    dailyRotateFileTransport,
  ],
});
