import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const signal = await request.json();
    
    if (!signal || !signal.id) {
      return NextResponse.json(
        { error: 'Invalid signal data' },
        { status: 400 }
      );
    }
    
    await redis.set(`signal:${signal.id}`, JSON.stringify(signal));
    await redis.sadd('signals:active', signal.id);
    
    return NextResponse.json({ success: true, signal });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save signal' },
      { status: 500 }
    );
  }
}