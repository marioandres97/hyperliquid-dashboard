import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheService } from '@/lib/services/cacheService';

// Mock dependencies
vi.mock('@/lib/core/logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    startTimer: vi.fn(() => ({
      done: vi.fn(() => 0),
    })),
  },
}));

vi.mock('@/lib/cache/memoryCache', () => ({
  memoryCache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    delPattern: vi.fn(() => 0),
    getStats: vi.fn(() => ({
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: '0 MB',
      keys: 0,
    })),
  },
}));

vi.mock('@/lib/redis', () => ({
  default: null,
  isRedisAvailable: () => false,
}));

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    cacheService = new CacheService();
  });

  describe('get', () => {
    it('should call fetcher when cache misses', async () => {
      const fetcher = vi.fn().mockResolvedValue('test-value');
      const options = { ttl: 60 };
      const result = await cacheService.get('test-key', fetcher, options);

      expect(fetcher).toHaveBeenCalled();
      expect(result).toBe('test-value');
    });

    it('should handle fetcher errors', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch error'));
      const options = { ttl: 60 };

      await expect(cacheService.get('test-key', fetcher, options)).rejects.toThrow('Fetch error');
    });

    it('should accept cache options with layer', async () => {
      const fetcher = vi.fn().mockResolvedValue('test-value');
      const options = { ttl: 60, layer: 'memory' as const };

      await cacheService.get('test-key', fetcher, options);

      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should accept value and options', async () => {
      await expect(
        cacheService.set('test-key', 'test-value', { ttl: 60 })
      ).resolves.not.toThrow();
    });
  });

  describe('invalidate', () => {
    it('should invalidate cache by pattern', async () => {
      await expect(cacheService.invalidate('test-*')).resolves.not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const stats = await cacheService.getStats();
      
      expect(stats).toHaveProperty('memory');
      expect(stats).toHaveProperty('redis');
      expect(stats).toHaveProperty('overall');
      expect(stats.memory).toHaveProperty('hits');
      expect(stats.memory).toHaveProperty('misses');
      expect(stats.memory).toHaveProperty('hitRate');
    });
  });
});
