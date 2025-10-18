import { NextRequest, NextResponse } from 'next/server';
import { getPositions, storePosition } from '@/lib/redis/services/positionsService';
import type { StoredPosition } from '@/lib/redis/services/positionsService';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;
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

// GET: Retrieve positions
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

    const positions = await getPositions(coin);
    return NextResponse.json({ positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}

// POST: Store a new position
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
    const position: StoredPosition = body.position;

    // Input validation
    if (!position || !position.coin || !position.id) {
      return NextResponse.json(
        { error: 'Invalid position data' },
        { status: 400 }
      );
    }

    if (!/^[A-Z]+$/.test(position.coin)) {
      return NextResponse.json(
        { error: 'Invalid coin format' },
        { status: 400 }
      );
    }

    const success = await storePosition(position);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to store position' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error storing position:', error);
    return NextResponse.json(
      { error: 'Failed to store position' },
      { status: 500 }
    );
  }
}
