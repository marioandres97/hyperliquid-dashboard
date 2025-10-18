/**
 * Error Handling System
 * 
 * Provides a hierarchy of custom error classes for consistent error handling
 * across the application.
 */

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.name = this.constructor.name;
  }
}

/**
 * Validation Error (400)
 * Used for invalid input or request validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', context?: ErrorContext) {
    super(message, 400, true, context);
  }
}

/**
 * Authentication Error (401)
 * Used for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: ErrorContext) {
    super(message, 401, true, context);
  }
}

/**
 * Not Found Error (404)
 * Used when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: ErrorContext) {
    super(message, 404, true, context);
  }
}

/**
 * Rate Limit Error (429)
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(message, 429, true, context);
  }
}

/**
 * Hyperliquid API Error (502)
 * Used when the Hyperliquid API returns an error
 */
export class HyperliquidAPIError extends AppError {
  constructor(message: string = 'Hyperliquid API error', context?: ErrorContext) {
    super(message, 502, true, context);
  }
}

/**
 * Internal Error (500)
 * Used for unexpected internal errors
 */
export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', context?: ErrorContext) {
    super(message, 500, false, context);
  }
}
