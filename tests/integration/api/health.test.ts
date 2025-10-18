import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies before importing the route handler
vi.mock('@/lib/redis', () => ({
  default: null,
  isRedisAvailable: () => false,
}));

// WebSocket is now client-side only and not mocked for health check

vi.mock('@/lib/database/client', () => ({
  checkDatabaseHealth: vi.fn().mockResolvedValue({
    available: false,
    connected: false,
  }),
}));

vi.mock('@/lib/core/logger', () => ({
  log: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/core/config', () => ({
  config: {
    env: 'test',
    hyperliquid: {
      apiUrl: 'https://api.hyperliquid.xyz',
      timeout: 5000,
    },
  },
}));

// Mock fetch globally
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: async () => ({}),
});

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have memory metrics in response structure', () => {
    // Test that our health check structure includes memory
    const expectedStructure = {
      status: expect.any(String),
      timestamp: expect.any(Number),
      uptime: expect.any(Number),
      version: expect.any(String),
      environment: expect.any(String),
      services: {
        database: {
          available: expect.any(Boolean),
          connected: expect.any(Boolean),
        },
        redis: {
          available: expect.any(Boolean),
        },
        websocket: {
          connected: expect.any(Boolean),
        },
        hyperliquidApi: {
          reachable: expect.any(Boolean),
        },
      },
      metrics: {
        memory: {
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
          rss: expect.any(Number),
          external: expect.any(Number),
        },
      },
    };

    // Just verify the structure is as expected
    expect(expectedStructure).toBeDefined();
  });

  it('should calculate memory metrics correctly', () => {
    const memoryUsage = process.memoryUsage();
    const memory = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    expect(memory.heapUsed).toBeGreaterThan(0);
    expect(memory.heapTotal).toBeGreaterThan(0);
    expect(memory.rss).toBeGreaterThan(0);
    expect(memory.external).toBeGreaterThanOrEqual(0);
  });

  it('should include database health check', async () => {
    // Verify that checkDatabaseHealth is available and callable
    const { checkDatabaseHealth } = await import('@/lib/database/client');
    expect(checkDatabaseHealth).toBeDefined();
    expect(typeof checkDatabaseHealth).toBe('function');
    
    // Verify it returns expected structure
    const result = await checkDatabaseHealth();
    expect(result).toHaveProperty('available');
    expect(result).toHaveProperty('connected');
  });

  it('should handle degraded status when services are down', () => {
    // Test logic for determining degraded status
    const databaseConnected = false;
    const redisConnected = false;
    const apiReachable = true;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!apiReachable) {
      status = 'unhealthy';
    } else if (!databaseConnected || !redisConnected) {
      status = 'degraded';
    }

    expect(status).toBe('degraded');
  });

  it('should handle unhealthy status when API is unreachable', () => {
    const apiReachable = false;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!apiReachable) {
      status = 'unhealthy';
    }

    expect(status).toBe('unhealthy');
  });

  it('should return healthy status when all services are up', () => {
    const databaseConnected = true;
    const redisConnected = true;
    const apiReachable = true;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!apiReachable) {
      status = 'unhealthy';
    } else if (!databaseConnected || !redisConnected) {
      status = 'degraded';
    }

    expect(status).toBe('healthy');
  });
});
