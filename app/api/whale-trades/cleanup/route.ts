import { NextRequest, NextResponse } from 'next/server';
import { whaleTradeRepository } from '@/lib/database/repositories/whaleTrade.repository';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { TRACKER_CONFIG } from '@/config/whale-trades.config';

/**
 * POST /api/whale-trades/cleanup
 * Delete old whale trades beyond retention period
 */
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await req.json().catch(() => ({}));
    
    // Get days to keep from request or use default from config
    const daysToKeep = body.daysToKeep !== undefined 
      ? parseInt(body.daysToKeep) 
      : TRACKER_CONFIG.retentionDays;

    // Validate daysToKeep
    if (isNaN(daysToKeep) || daysToKeep < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid daysToKeep parameter. Must be a non-negative number.',
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Maximum retention is 365 days to prevent accidental deletion of all data
    if (daysToKeep > 365) {
      return NextResponse.json(
        {
          success: false,
          error: 'daysToKeep cannot exceed 365 days',
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    try {
      // Perform cleanup
      const deletedCount = await whaleTradeRepository.cleanupOld(daysToKeep);

      return NextResponse.json(
        {
          success: true,
          message: `Successfully cleaned up ${deletedCount} old whale trades`,
          data: {
            deletedCount,
            daysToKeep,
            cleanupDate: new Date().toISOString(),
          },
        },
        { headers: rateLimitResult.headers }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to cleanup old whale trades',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500, headers: rateLimitResult.headers }
      );
    }
  });
}

/**
 * GET /api/whale-trades/cleanup
 * Get cleanup configuration and preview
 */
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(req.url);
    const daysToKeep = searchParams.get('daysToKeep');

    const days = daysToKeep ? parseInt(daysToKeep) : TRACKER_CONFIG.retentionDays;

    if (isNaN(days) || days < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid daysToKeep parameter',
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      // Count trades that would be deleted
      const count = await whaleTradeRepository.count({
        timestamp: {
          lt: cutoffDate,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            daysToKeep: days,
            cutoffDate: cutoffDate.toISOString(),
            tradesAffected: count,
            message: count > 0 
              ? `${count} trades would be deleted` 
              : 'No trades to delete',
          },
        },
        { headers: rateLimitResult.headers }
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get cleanup preview',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500, headers: rateLimitResult.headers }
      );
    }
  });
}
