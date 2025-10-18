/**
 * Global Error Handler Middleware
 * 
 * Catches and formats errors consistently across the application.
 */

import { NextResponse } from 'next/server';
import { AppError } from '@/lib/core/errors';
import { log } from '@/lib/core/logger';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    context?: Record<string, unknown>;
  };
}

/**
 * Convert error name to error code format
 * Example: ValidationError -> VALIDATION_ERROR
 */
function getErrorCode(errorName: string): string {
  return errorName
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '');
}

/**
 * Global error handler middleware function
 * 
 * Usage in API routes:
 * ```
 * export async function GET(request: Request) {
 *   return errorHandler(async () => {
 *     // Your route logic here
 *     return NextResponse.json({ data: 'success' });
 *   });
 * }
 * ```
 */
export async function errorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse<ErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Handle error and return formatted response
 */
export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // Handle AppError instances
  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      error: {
        code: getErrorCode(error.name),
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        ...(error.context && { context: error.context }),
      },
    };

    // Log operational errors as warnings
    if (error.isOperational) {
      log.warn('Operational error occurred', {
        code: errorResponse.error.code,
        message: error.message,
        statusCode: error.statusCode,
        context: error.context,
      });
    } else {
      // Log unexpected errors with full stack trace
      log.error('Unexpected error occurred', error, {
        code: errorResponse.error.code,
        statusCode: error.statusCode,
        context: error.context,
      });
    }

    return NextResponse.json(errorResponse, { status: error.statusCode });
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    log.error('Unhandled error occurred', error);

    const errorResponse: ErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }

  // Handle unknown error types
  log.error('Unknown error type occurred', undefined, {
    error: String(error),
  });

  const errorResponse: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(errorResponse, { status: 500 });
}
