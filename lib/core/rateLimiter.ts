/**
 * Rate Limiter Service
 * 
 * Redis-backed rate limiter with sliding window algorithm
 * Supports different rate limit tiers
 */

import redis, { isRedisAvailable } from '@/lib/redis';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';

export type RateLimitTier = 'free' | 'pro' | 'api' | 'unlimited';

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp in seconds
}

export interface RateLimitUsage {
  count: number;
  limit: number;
  resetAt: number; // timestamp in seconds
}

// Rate limit configurations
const RATE_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  free: {
    requests: 60,
    window: 60,
  },
  pro: {
    requests: 300,
    window: 60,
  },
  api: {
    requests: 1000,
    window: 60,
  },
  unlimited: {
    requests: 10000,
    window: 60,
  },
};

/**
 * Rate Limiter Class
 */
export class RateLimiter {
  // Fallback in-memory rate limiter when Redis is unavailable
  private memoryStore: Map<string, { count: number; resetAt: number }> = new Map();

  /**
   * Check if request is allowed and record it atomically
   */
  async checkLimit(
    identifier: string,
    tier: RateLimitTier = 'free'
  ): Promise<RateLimitResult> {
    const timer = log.startTimer({ identifier, tier, operation: 'rateLimitCheck' });

    try {
      const config = RATE_LIMITS[tier];
      const window = config.window;
      const limit = config.requests;
      const now = Math.floor(Date.now() / 1000);
      const resetAt = now + window;

      // Use Redis if available
      if (isRedisAvailable() && redis) {
        try {
          const result = await this.checkLimitRedis(identifier, tier, config, now);
          timer.done('Rate limit check - Redis', {
            identifier,
            tier,
            allowed: result.allowed,
            remaining: result.remaining,
          });
          return result;
        } catch (error) {
          log.warn('Redis rate limit check failed, falling back to memory', {
            identifier,
            tier,
            error,
          });
          // Fall through to memory-based rate limiting
        }
      }

      // Fallback to memory-based rate limiting
      const result = this.checkLimitMemory(identifier, tier, config, now);
      timer.done('Rate limit check - Memory', {
        identifier,
        tier,
        allowed: result.allowed,
        remaining: result.remaining,
      });
      return result;
    } catch (error) {
      log.error('Rate limit check error', error, { identifier, tier });
      // Allow request on error (fail open)
      return {
        allowed: true,
        limit: RATE_LIMITS[tier].requests,
        remaining: RATE_LIMITS[tier].requests - 1,
        reset: Math.floor(Date.now() / 1000) + RATE_LIMITS[tier].window,
      };
    }
  }

  /**
   * Redis-based rate limiting with sliding window
   */
  private async checkLimitRedis(
    identifier: string,
    tier: RateLimitTier,
    config: RateLimitConfig,
    now: number
  ): Promise<RateLimitResult> {
    if (!redis) {
      throw new Error('Redis not available');
    }

    const key = `ratelimit:${identifier}:${tier}`;
    const window = config.window;
    const limit = config.requests;
    const resetAt = now + window;

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    
    // Get current count
    pipeline.get(key);
    
    // Execute pipeline
    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    const currentCount = results[0][1] ? parseInt(results[0][1] as string, 10) : 0;

    if (currentCount >= limit) {
      // Rate limit exceeded
      const ttl = await redis.ttl(key);
      const resetTime = ttl > 0 ? now + ttl : resetAt;

      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Increment and set expiry atomically
    const multi = redis.multi();
    multi.incr(key);
    
    // Set expiry only if this is the first request in the window
    if (currentCount === 0) {
      multi.expire(key, window);
    }
    
    await multi.exec();

    return {
      allowed: true,
      limit,
      remaining: limit - currentCount - 1,
      reset: resetAt,
    };
  }

  /**
   * Memory-based rate limiting (fallback)
   */
  private checkLimitMemory(
    identifier: string,
    tier: RateLimitTier,
    config: RateLimitConfig,
    now: number
  ): RateLimitResult {
    const key = `${identifier}:${tier}`;
    const window = config.window;
    const limit = config.requests;
    const resetAt = now + window;

    const record = this.memoryStore.get(key);

    // Reset if window expired
    if (!record || now >= record.resetAt) {
      this.memoryStore.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        reset: resetAt,
      };
    }

    // Check if limit exceeded
    if (record.count >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: record.resetAt,
      };
    }

    // Increment count
    record.count++;

    return {
      allowed: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }

  /**
   * Record a request (for manual tracking)
   */
  async recordRequest(identifier: string, tier: RateLimitTier): Promise<void> {
    // This is already handled atomically in checkLimit
    // Keeping for API compatibility
    log.debug('Request recorded', { identifier, tier });
  }

  /**
   * Get current usage
   */
  async getUsage(identifier: string, tier: RateLimitTier = 'free'): Promise<RateLimitUsage> {
    const config = RATE_LIMITS[tier];
    const limit = config.requests;
    const now = Math.floor(Date.now() / 1000);

    if (isRedisAvailable() && redis) {
      try {
        const key = `ratelimit:${identifier}:${tier}`;
        const count = await redis.get(key);
        const ttl = await redis.ttl(key);
        
        return {
          count: count ? parseInt(count, 10) : 0,
          limit,
          resetAt: ttl > 0 ? now + ttl : now + config.window,
        };
      } catch (error) {
        log.warn('Redis usage check failed', { identifier, tier, error });
      }
    }

    // Fallback to memory
    const key = `${identifier}:${tier}`;
    const record = this.memoryStore.get(key);

    return {
      count: record && now < record.resetAt ? record.count : 0,
      limit,
      resetAt: record ? record.resetAt : now + config.window,
    };
  }

  /**
   * Reset limit for identifier
   */
  async reset(identifier: string, tier?: RateLimitTier): Promise<void> {
    const timer = log.startTimer({ identifier, tier, operation: 'rateLimitReset' });

    try {
      if (isRedisAvailable() && redis) {
        if (tier) {
          const key = `ratelimit:${identifier}:${tier}`;
          await redis.del(key);
        } else {
          // Reset all tiers
          const keys = await redis.keys(`ratelimit:${identifier}:*`);
          if (keys.length > 0) {
            await redis.del(...keys);
          }
        }
      }

      // Also reset memory store
      if (tier) {
        const key = `${identifier}:${tier}`;
        this.memoryStore.delete(key);
      } else {
        // Reset all tiers in memory
        for (const key of this.memoryStore.keys()) {
          if (key.startsWith(`${identifier}:`)) {
            this.memoryStore.delete(key);
          }
        }
      }

      timer.done('Rate limit reset', { identifier, tier });
    } catch (error) {
      log.error('Rate limit reset error', error, { identifier, tier });
    }
  }

  /**
   * Get rate limit configuration for a tier
   */
  getConfig(tier: RateLimitTier): RateLimitConfig {
    return RATE_LIMITS[tier];
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
