import redis, { isRedisAvailable } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    if (!isRedisAvailable() || !redis) {
      return NextResponse.json(
        { error: 'Redis not available' },
        { status: 503 }
      );
    }

    // Obtener todos los IDs de señales
    const signalIds = (await redis.smembers('signals:active')) || [];
    
    // Eliminar cada señal individualmente
    const pipeline = redis.pipeline();
    signalIds.forEach(id => {
      pipeline.del(`signal:${id}`);
    });
    
    // Eliminar el set completo
    pipeline.del('signals:active');
    
    await pipeline.exec();
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${signalIds.length} signals` 
    });
  } catch (error) {
    console.error('Error resetting signals:', error);
    return NextResponse.json(
      { error: 'Failed to reset signals' },
      { status: 500 }
    );
  }
}