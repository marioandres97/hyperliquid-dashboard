import { NextResponse } from 'next/server';
import redis, { isRedisAvailable } from '@/lib/redis';
import { getWSClient } from '@/lib/hyperliquid/websocket';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    redis: {
      available: boolean;
      connected?: boolean;
      latency?: number;
    };
    websocket: {
      connected: boolean;
    };
    hyperliquidApi: {
      reachable: boolean;
      latency?: number;
    };
  };
}

async function checkRedisHealth(): Promise<{ available: boolean; connected?: boolean; latency?: number }> {
  if (!isRedisAvailable() || !redis) {
    return { available: false };
  }

  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;
    
    return {
      available: true,
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      available: true,
      connected: false,
    };
  }
}

async function checkHyperliquidApi(): Promise<{ reachable: boolean; latency?: number }> {
  try {
    const start = Date.now();
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'meta' }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    const latency = Date.now() - start;
    
    if (response.ok) {
      return { reachable: true, latency };
    }
    
    return { reachable: false };
  } catch (error) {
    return { reachable: false };
  }
}

export async function GET() {
  try {
    const wsClient = getWSClient();
    
    // Run health checks in parallel
    const [redisHealth, hyperliquidHealth] = await Promise.all([
      checkRedisHealth(),
      checkHyperliquidApi(),
    ]);

    const websocketHealth = {
      connected: wsClient.getConnectionStatus(),
    };

    // Determine overall health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!hyperliquidHealth.reachable) {
      status = 'unhealthy';
    } else if (!redisHealth.connected || !websocketHealth.connected) {
      status = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: Date.now(),
      services: {
        redis: redisHealth,
        websocket: websocketHealth,
        hyperliquidApi: hyperliquidHealth,
      },
    };

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    console.error('Error checking health:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: 'Failed to check health',
      },
      { status: 503 }
    );
  }
}
