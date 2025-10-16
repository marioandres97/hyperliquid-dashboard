import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, exitPrice, exitTimestamp } = await request.json();
    
    const signalData = await redis.get(`signal:${id}`);
    
    if (!signalData) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }
    
    const signal = JSON.parse(signalData as string);
    
    const updatedSignal = {
      ...signal,
      status,
      exitPrice,
      exitTimestamp
    };
    
    await redis.set(`signal:${id}`, JSON.stringify(updatedSignal));
    
    if (status !== 'active') {
      await redis.srem('signals:active', id);
    }
    
    return NextResponse.json({ success: true, signal: updatedSignal });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    );
  }
}