import { NextResponse } from 'next/server';
import redis, { isRedisAvailable } from '@/lib/redis';
import { getWSClient } from '@/lib/hyperliquid/websocket';
import { errorHandler } from '@/lib/middleware/errorHandler';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';

export const dynamic = 'force-dynamic';

// Track server start time for uptime calculation
const serverStartTime = Date.now();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
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
    
    log.debug('Redis health check passed', { latency });
    
    return {
      available: true,
      connected: true,
      latency,
    };
  } catch (error) {
    log.warn('Redis health check failed', { error });
    return {
      available: true,
      connected: false,
    };
  }
}

async function checkHyperliquidApi(): Promise<{ reachable: boolean; latency?: number }> {
  try {
    const start = Date.now();
    const response = await fetch(`${config.hyperliquid.apiUrl}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'meta' }),
      signal: AbortSignal.timeout(config.hyperliquid.timeout),
    });
    const latency = Date.now() - start;
    
    if (response.ok) {
      log.debug('Hyperliquid API health check passed', { latency });
      return { reachable: true, latency };
    }
    
    log.warn('Hyperliquid API health check failed', { status: response.status });
    return { reachable: false };
  } catch (error) {
    log.warn('Hyperliquid API health check error', { error });
    return { reachable: false };
  }
}

export async function GET() {
  return errorHandler(async () => {
    log.info('Health check started');
    
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

    const uptime = Date.now() - serverStartTime;

    const healthStatus: HealthStatus = {
      status,
      timestamp: Date.now(),
      uptime,
      version: process.env.npm_package_version || '0.1.0',
      environment: config.env,
      services: {
        redis: redisHealth,
        websocket: websocketHealth,
        hyperliquidApi: hyperliquidHealth,
      },
    };

    log.info('Health check completed', {
      status,
      uptime,
      redisConnected: redisHealth.connected,
      wsConnected: websocketHealth.connected,
      apiReachable: hyperliquidHealth.reachable,
    });

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: statusCode });
  });
}
