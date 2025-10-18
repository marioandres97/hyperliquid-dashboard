import redis, { isRedisAvailable } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/middleware/rateLimit';
import { errorHandler } from '@/lib/middleware/errorHandler';

// Enable ISR with 30 second revalidation
export const revalidate = 30;

export async function POST(request: NextRequest) {
  return errorHandler(async () => {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    if (!isRedisAvailable() || !redis) {
      return NextResponse.json(
        { error: 'Redis not available' },
        { status: 503, headers: rateLimitResult.headers }
      );
    }

    const signal = await request.json();
    
    if (!signal || !signal.id) {
      return NextResponse.json(
        { error: 'Invalid signal data' },
        { status: 400, headers: rateLimitResult.headers }
      );
    }
    
    await redis.set(`signal:${signal.id}`, JSON.stringify(signal));
    await redis.sadd('signals:active', signal.id);
    
    return NextResponse.json(
      { success: true, signal },
      { headers: rateLimitResult.headers }
    );
  });
}