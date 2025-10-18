import { NextRequest, NextResponse } from 'next/server';
import { getTrades, storeTrade, getLargeTrades, getTradeStats } from '@/lib/redis/services/tradesService';
import type { StoredTrade } from '@/lib/redis/services/tradesService';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIdentifier(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || 'unknown';
}

// GET: Retrieve trades
export async function GET(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  
  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const coin = searchParams.get('coin');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = searchParams.get('limit');
    const type = searchParams.get('type'); // 'all', 'large', or 'stats'

    if (!coin) {
      return NextResponse.json(
        { error: 'coin parameter is required' },
        { status: 400 }
      );
    }

    // Input validation
    if (!/^[A-Z]+$/.test(coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400 }
      );
    }

    if (type === 'large') {
      const largeTrades = await getLargeTrades(
        coin,
        limit ? parseInt(limit) : 50
      );
      return NextResponse.json({ trades: largeTrades });
    }

    if (type === 'stats') {
      const start = startTime ? parseInt(startTime) : Date.now() - 24 * 60 * 60 * 1000;
      const end = endTime ? parseInt(endTime) : Date.now();
      const stats = await getTradeStats(coin, start, end);
      return NextResponse.json({ stats });
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

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

// POST: Store a new trade
export async function POST(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  
  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const trade: StoredTrade = body.trade;

    // Input validation
    if (!trade || !trade.coin || !trade.id) {
      return NextResponse.json(
        { error: 'Invalid trade data' },
        { status: 400 }
      );
    }

    if (!/^[A-Z]+$/.test(trade.coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400 }
      );
    }

    if (typeof trade.price !== 'number' || trade.price <= 0) {
      return NextResponse.json(
        { error: 'Invalid price' },
        { status: 400 }
      );
    }

    if (typeof trade.size !== 'number' || trade.size <= 0) {
      return NextResponse.json(
        { error: 'Invalid size' },
        { status: 400 }
      );
    }

    const success = await storeTrade(trade);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to store trade' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error storing trade:', error);
    return NextResponse.json(
      { error: 'Failed to store trade' },
      { status: 500 }
    );
  }
}
