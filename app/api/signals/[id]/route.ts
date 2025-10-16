import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, exitPrice, exitTimestamp } = await request.json();
    
    const signalData = await redis.get(`signal:${params.id}`);
    
    if (!signalData) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }
    
    const signal = JSON.parse(signalData);
    
    const updatedSignal = {
      ...signal,
      status,
      exitPrice,
      exitTimestamp
    };
    
    await redis.set(`signal:${params.id}`, JSON.stringify(updatedSignal));
    
    if (status !== 'active') {
      await redis.srem('signals:active', params.id);
    }
    
    return NextResponse.json({ success: true, signal: updatedSignal });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    );
  }
}