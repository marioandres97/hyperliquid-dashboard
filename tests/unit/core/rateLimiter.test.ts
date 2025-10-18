import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimiter } from '@/lib/core/rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear mocks and reset state between tests
    vi.clearAllMocks();
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      const identifier = 'test-user-1';
      const result = await rateLimiter.checkLimit(identifier, 'free');
      
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(60);
      expect(result.remaining).toBeLessThan(60);
    });

    it('should track remaining requests correctly', async () => {
      const identifier = 'test-user-2';
      
      const result1 = await rateLimiter.checkLimit(identifier, 'free');
      const result2 = await rateLimiter.checkLimit(identifier, 'free');
      
      expect(result1.remaining).toBeGreaterThan(result2.remaining);
    });

    it('should use correct limits for different tiers', async () => {
      const identifier = 'test-user-3';
      
      const freeResult = await rateLimiter.checkLimit(identifier + '-free', 'free');
      const proResult = await rateLimiter.checkLimit(identifier + '-pro', 'pro');
      const apiResult = await rateLimiter.checkLimit(identifier + '-api', 'api');
      
      expect(freeResult.limit).toBe(60);
      expect(proResult.limit).toBe(300);
      expect(apiResult.limit).toBe(1000);
    });

    it('should deny requests when limit exceeded', async () => {
      const identifier = 'test-user-4';
      const tier = 'free';
      const config = rateLimiter.getConfig(tier);
      
      // Make requests up to the limit
      for (let i = 0; i < config.requests; i++) {
        await rateLimiter.checkLimit(identifier, tier);
      }
      
      // Next request should be denied
      const result = await rateLimiter.checkLimit(identifier, tier);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('getUsage', () => {
    it('should return current usage', async () => {
      const identifier = 'test-user-5';
      const tier = 'free';
      
      await rateLimiter.checkLimit(identifier, tier);
      await rateLimiter.checkLimit(identifier, tier);
      
      const usage = await rateLimiter.getUsage(identifier, tier);
      
      expect(usage.count).toBeGreaterThan(0);
      expect(usage.limit).toBe(60);
      expect(usage.resetAt).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('reset', () => {
    it('should reset limit for identifier', async () => {
      const identifier = 'test-user-6';
      const tier = 'free';
      
      // Make some requests
      await rateLimiter.checkLimit(identifier, tier);
      await rateLimiter.checkLimit(identifier, tier);
      
      // Reset
      await rateLimiter.reset(identifier, tier);
      
      // Usage should be back to 0
      const usage = await rateLimiter.getUsage(identifier, tier);
      expect(usage.count).toBe(0);
    });
  });

  describe('getConfig', () => {
    it('should return correct config for tier', () => {
      const freeConfig = rateLimiter.getConfig('free');
      const proConfig = rateLimiter.getConfig('pro');
      
      expect(freeConfig.requests).toBe(60);
      expect(freeConfig.window).toBe(60);
      expect(proConfig.requests).toBe(300);
      expect(proConfig.window).toBe(60);
    });
  });
});
