import { NextRequest, NextResponse } from 'next/server';
import { getOrderBookSnapshots, getLatestOrderBookSnapshot, storeOrderBookSnapshot, analyzeOrderBookHistory } from '@/lib/redis/services/orderbookService';
import type { OrderBookSnapshot } from '@/lib/redis/services/orderbookService';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Higher limit for orderbook data
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

// GET: Retrieve orderbook snapshots
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
    const latest = searchParams.get('latest') === 'true';
    const analyze = searchParams.get('analyze') === 'true';

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

    if (latest) {
      const snapshot = await getLatestOrderBookSnapshot(coin);
      return NextResponse.json({ snapshot });
    }

    if (analyze) {
      const start = startTime ? parseInt(startTime) : Date.now() - 24 * 60 * 60 * 1000;
      const end = endTime ? parseInt(endTime) : Date.now();
      const analysis = await analyzeOrderBookHistory(coin, start, end);
      return NextResponse.json({ analysis });
    }

    const start = startTime ? parseInt(startTime) : Date.now() - 24 * 60 * 60 * 1000;
    const end = endTime ? parseInt(endTime) : Date.now();
    const snapshots = await getOrderBookSnapshots(
      coin,
      start,
      end,
      limit ? parseInt(limit) : 100
    );

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error('Error fetching orderbook snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orderbook snapshots' },
      { status: 500 }
    );
  }
}

// POST: Store a new orderbook snapshot
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
    const snapshot: OrderBookSnapshot = body.snapshot;

    // Input validation
    if (!snapshot || !snapshot.coin || !snapshot.bids || !snapshot.asks) {
      return NextResponse.json(
        { error: 'Invalid snapshot data' },
        { status: 400 }
      );
    }

    if (!/^[A-Z]+$/.test(snapshot.coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400 }
      );
    }

    const success = await storeOrderBookSnapshot(snapshot);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to store snapshot' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error storing snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to store snapshot' },
      { status: 500 }
    );
  }
}
