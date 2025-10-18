type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    if (this.isDevelopment) {
      // Simple console output in development
      return message;
    }

    // Structured JSON in production
    return JSON.stringify({
      level,
      message,
      timestamp,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    });
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    if (this.isDevelopment) {
      // Use appropriate console method
      switch (level) {
        case 'debug':
          console.debug(`[DEBUG] ${formattedMessage}`, context);
          break;
        case 'info':
          console.info(`[INFO] ${formattedMessage}`, context);
          break;
        case 'warn':
          console.warn(`[WARN] ${formattedMessage}`, context);
          break;
        case 'error':
          console.error(`[ERROR] ${formattedMessage}`, context, error);
          break;
      }
    } else {
      // Structured logging in production
      console.log(formattedMessage);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  // Utility for timing operations
  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { durationMs: duration });
    };
  }

  // Utility for tracking API calls
  apiCall(method: string, url: string, statusCode?: number, duration?: number) {
    this.info('API call', {
      method,
      url,
      statusCode,
      durationMs: duration,
    });
  }

  // Utility for tracking WebSocket events
  websocketEvent(event: string, coin?: string, details?: Record<string, any>) {
    this.debug('WebSocket event', {
      event,
      coin,
      ...details,
    });
  }

  // Utility for tracking user actions
  userAction(action: string, details?: Record<string, any>) {
    this.info('User action', {
      action,
      ...details,
    });
  }
}

// Export singleton instance
export const logger = new Logger();
