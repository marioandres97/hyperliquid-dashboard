import redis, { isRedisAvailable } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isRedisAvailable() || !redis) {
      return NextResponse.json(
        { error: 'Redis not available' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Intentar obtener señal existente
    const signalData = await redis.get(`signal:${id}`);
    
    let updatedSignal;
    
    if (signalData) {
      // Actualizar señal existente
      const signal = JSON.parse(signalData as string);
      updatedSignal = { ...signal, ...body };
    } else {
      // Crear nueva señal si no existe (viene de tracking)
      updatedSignal = { id, ...body, status: body.status || 'active' };
    }
    
    await redis.set(`signal:${id}`, JSON.stringify(updatedSignal));
    
    // Siempre mantener en el set para poder calcular stats
    await redis.sadd('signals:active', id);
    
    return NextResponse.json({ success: true, signal: updatedSignal });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    );
  }
}