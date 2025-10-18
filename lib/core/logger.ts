/**
 * Structured Logging System
 * 
 * Provides Winston-based logging with context support and performance timing.
 */

import winston from 'winston';

export interface LogContext {
  requestId?: string;
  userId?: string;
  asset?: string;
  [key: string]: unknown;
}

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure log level from environment or default
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Create custom format for pretty printing in development
const prettyFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Add context if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Configure winston logger
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isDevelopment
      ? winston.format.combine(
          winston.format.colorize(),
          prettyFormat
        )
      : winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  // Don't exit on uncaught errors
  exitOnError: false,
});

/**
 * Timer class for performance logging
 */
export class Timer {
  private startTime: number;
  private context?: LogContext;

  constructor(context?: LogContext) {
    this.startTime = Date.now();
    this.context = context;
  }

  /**
   * Stop the timer and log the duration
   */
  done(message: string, additionalContext?: LogContext): number {
    const duration = Date.now() - this.startTime;
    const context = { ...this.context, ...additionalContext, duration: `${duration}ms` };
    logger.info(message, context);
    return duration;
  }
}

/**
 * Structured logger with context support
 */
export const log = {
  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    logger.debug(message, context);
  },

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    logger.info(message, context);
  },

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    logger.warn(message, context);
  },

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };
    logger.error(message, errorContext);
  },

  /**
   * Start a timer for performance logging
   */
  startTimer(context?: LogContext): Timer {
    return new Timer(context);
  },
};

export default log;
