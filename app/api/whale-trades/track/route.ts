/**
 * Whale Trades Batch Tracking Endpoint
 * 
 * POST /api/whale-trades/track - Track multiple trades in batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { trackTrades, TradeData } from '@/lib/services/whaleTradeTracker';

/**
 * POST /api/whale-trades/track
 * Track multiple trades in batch
 */
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await req.json();
    const { trades } = body;

    if (!trades || !Array.isArray(trades)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: trades array is required',
        },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    if (trades.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            total: 0,
            whaleTrades: 0,
            stored: 0,
            errors: 0,
          },
        },
        { status: 200, headers: rateLimitResult.headers }
      );
    }

    // Convert trades to TradeData format
    const tradeData: TradeData[] = trades.map((trade: any) => ({
      asset: trade.asset,
      side: trade.side,
      price: trade.price,
      size: trade.size,
      timestamp: trade.timestamp ? new Date(trade.timestamp) : undefined,
      tradeId: trade.tradeId,
      priceImpact: trade.priceImpact,
      metadata: trade.metadata,
    }));

    // Track trades in batch
    const results = await trackTrades(tradeData);

    // Aggregate results
    const summary = {
      total: results.length,
      whaleTrades: results.filter(r => r.isWhaleTrade).length,
      stored: results.filter(r => r.stored).length,
      errors: results.filter(r => r.isWhaleTrade && !r.stored).length,
      byCategory: results.reduce((acc, r) => {
        if (r.category) {
          acc[r.category] = (acc[r.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200, headers: rateLimitResult.headers }
    );
  });
}
