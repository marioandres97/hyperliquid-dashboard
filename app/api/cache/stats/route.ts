/**
 * Cache Statistics Endpoint
 * 
 * Returns cache performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/services/cacheService';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { log } from '@/lib/core/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    log.info('Cache stats requested');

    // Get cache statistics
    const stats = await cacheService.getStats();

    log.debug('Cache stats retrieved', stats);

    return NextResponse.json(stats, {
      headers: rateLimitResult.headers,
    });
  });
}
