import { NextRequest, NextResponse } from 'next/server';
import { getTrades, storeTrade, getLargeTrades, getTradeStats } from '@/lib/redis/services/tradesService';
import type { StoredTrade } from '@/lib/redis/services/tradesService';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';

// GET: Retrieve trades
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const { searchParams } = new URL(req.url);
    const coin = searchParams.get('coin');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = searchParams.get('limit');
    const type = searchParams.get('type'); // 'all', 'large', or 'stats'

    if (!coin) {
      return NextResponse.json(
        { error: 'coin parameter is required' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    // Input validation
    if (!/^[A-Z]+$/.test(coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    if (type === 'large') {
      const largeTrades = await getLargeTrades(
        coin,
        limit ? parseInt(limit) : 50
      );
      return NextResponse.json(
        { trades: largeTrades },
        { headers: rateLimitResult.headers }
      );
    }

    if (type === 'stats') {
      const start = startTime ? parseInt(startTime) : Date.now() - 24 * 60 * 60 * 1000;
      const end = endTime ? parseInt(endTime) : Date.now();
      const stats = await getTradeStats(coin, start, end);
      return NextResponse.json(
        { stats },
        { headers: rateLimitResult.headers }
      );
    }

    // Default: get all trades
    const start = startTime ? parseInt(startTime) : Date.now() - 24 * 60 * 60 * 1000;
    const end = endTime ? parseInt(endTime) : Date.now();
    const trades = await getTrades(
      coin,
      start,
      end,
      limit ? parseInt(limit) : 100
    );

    return NextResponse.json(
      { trades },
      { headers: rateLimitResult.headers }
    );
  });
}

// POST: Store a new trade
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await req.json();
    const trade: StoredTrade = body.trade;

    // Input validation
    if (!trade || !trade.coin || !trade.id) {
      return NextResponse.json(
        { error: 'Invalid trade data' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    if (!/^[A-Z]+$/.test(trade.coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    if (typeof trade.price !== 'number' || trade.price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    if (typeof trade.size !== 'number' || trade.size <= 0) {
      return NextResponse.json(
        { error: 'Invalid size' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }

    const success = await storeTrade(trade);

    if (success) {
      return NextResponse.json(
        { success: true },
        { headers: rateLimitResult.headers }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to store trade' },
        { status: 500, headers: rateLimitResult.headers }
      );
    }
  });
}
