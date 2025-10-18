/**
 * Rate Limit Middleware
 * 
 * Middleware to apply rate limiting to API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, type RateLimitTier, type RateLimitResult } from '@/lib/core/rateLimiter';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';
import type { ErrorResponse } from '@/lib/middleware/errorHandler';

// Paths that should skip rate limiting
const SKIP_PATHS = ['/api/health'];

/**
 * Extract identifier from request
 * Uses IP address as identifier for unauthenticated requests
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from auth header (if implementing auth in future)
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Determine rate limit tier for request
 * Default to 'free' for unauthenticated requests
 */
function getTier(req: NextRequest): RateLimitTier {
  // Check for tier header (for API keys in future)
  const tierHeader = req.headers.get('x-rate-limit-tier');
  if (tierHeader && ['free', 'pro', 'api', 'unlimited'].includes(tierHeader)) {
    return tierHeader as RateLimitTier;
  }

  // Default to free tier
  return 'free';
}

/**
 * Check if path should skip rate limiting
 */
function shouldSkipRateLimit(pathname: string): boolean {
  return SKIP_PATHS.some(path => pathname === path || pathname.startsWith(path));
}

/**
 * Create rate limit headers
 */
function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Rate limit middleware function
 * 
 * Usage in API routes:
 * ```
 * export async function GET(req: NextRequest) {
 *   const rateLimitResult = await rateLimitMiddleware(req);
 *   if (!rateLimitResult.allowed) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // Your route logic here
 *   const data = await fetchData();
 *   
 *   return NextResponse.json({ data }, { 
 *     headers: rateLimitResult.headers 
 *   });
 * }
 * ```
 */
export async function rateLimitMiddleware(req: NextRequest): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
  response?: NextResponse<ErrorResponse>;
}> {
  // Skip rate limiting if disabled
  if (!config.features.rateLimitEnabled) {
    log.debug('Rate limiting disabled');
    return { allowed: true, headers: {} };
  }

  // Skip rate limiting for health check
  const url = new URL(req.url);
  if (shouldSkipRateLimit(url.pathname)) {
    log.debug('Rate limiting skipped', { path: url.pathname });
    return { allowed: true, headers: {} };
  }

  const identifier = getIdentifier(req);
  const tier = getTier(req);

  try {
    const result = await rateLimiter.checkLimit(identifier, tier);
    const headers = createRateLimitHeaders(result);

    if (!result.allowed) {
      log.warn('Rate limit exceeded', {
        identifier,
        tier,
        limit: result.limit,
        reset: result.reset,
        path: url.pathname,
      });

      const retryAfter = result.reset - Math.floor(Date.now() / 1000);

      const errorResponse: ErrorResponse = {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
          timestamp: new Date().toISOString(),
          context: {
            limit: result.limit,
            window: rateLimiter.getConfig(tier).window,
            retryAfter,
          },
        },
      };

      const response = NextResponse.json(errorResponse, {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      });

      return { allowed: false, headers, response };
    }

    log.debug('Rate limit check passed', {
      identifier,
      tier,
      remaining: result.remaining,
      path: url.pathname,
    });

    return { allowed: true, headers };
  } catch (error) {
    log.error('Rate limit middleware error', error, {
      identifier,
      tier,
      path: url.pathname,
    });

    // Fail open - allow request on error
    return { allowed: true, headers: {} };
  }
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  headers: Record<string, string>
): Response {
  const newHeaders = new Headers(response.headers);
  
  for (const [key, value] of Object.entries(headers)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
