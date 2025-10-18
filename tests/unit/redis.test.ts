import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the config
vi.mock('@/lib/core/config', () => ({
  config: {
    redis: {
      url: undefined,
    },
    env: 'test',
  },
}));

// Mock ioredis
vi.mock('ioredis', () => {
  return {
    default: vi.fn(),
  };
});

vi.mock('@/lib/core/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Redis Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isRedisAvailable', () => {
    it('should check if Redis is configured', async () => {
      const { isRedisAvailable } = await import('@/lib/redis');
      expect(typeof isRedisAvailable).toBe('function');
      expect(isRedisAvailable()).toBe(false);
    });
  });

  describe('redis client', () => {
    it('should be null when not configured', async () => {
      const redis = (await import('@/lib/redis')).default;
      expect(redis).toBeNull();
    });
  });
});
