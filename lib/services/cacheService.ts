/**
 * Multi-Layer Cache Service
 * 
 * Implements 3-layer caching architecture:
 * - Layer 1: In-Memory Cache (ultra-fast, <1ms)
 * - Layer 2: Redis Cache (fast, ~10-15ms)
 * - Layer 3: Source (database or external API, 100-500ms)
 */

import redis, { isRedisAvailable } from '@/lib/redis';
import { memoryCache } from '@/lib/cache/memoryCache';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';

export interface CacheOptions {
  ttl: number;
  layer?: 'memory' | 'redis' | 'both';
}

export interface CacheStats {
  memory: {
    hits: number;
    misses: number;
    hitRate: number;
    size: string;
    keys: number;
  };
  redis: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  overall: {
    hitRate: number;
  };
}

/**
 * Multi-Layer Cache Service Class
 */
export class CacheService {
  private redisHits: number = 0;
  private redisMisses: number = 0;

  /**
   * Get value from cache with automatic fallback
   * Checks memory -> redis -> source
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const timer = log.startTimer({ key, operation: 'cacheGet' });
    const { ttl, layer = 'both' } = options;

    try {
      // Layer 1: Check memory cache
      if (layer === 'memory' || layer === 'both') {
        const memoryValue = memoryCache.get<T>(key);
        if (memoryValue !== undefined) {
          timer.done('Cache hit - memory', { key, layer: 'memory' });
          return memoryValue;
        }
      }

      // Layer 2: Check Redis cache
      if ((layer === 'redis' || layer === 'both') && isRedisAvailable() && redis) {
        try {
          const redisValue = await redis.get(key);
          if (redisValue !== null) {
            this.redisHits++;
            const parsed = JSON.parse(redisValue) as T;
            
            // Backfill memory cache if using both layers
            if (layer === 'both') {
              memoryCache.set(key, parsed, Math.min(ttl, config.cache.memoryTTL || 10));
            }
            
            timer.done('Cache hit - redis', { key, layer: 'redis' });
            return parsed;
          }
          this.redisMisses++;
        } catch (error) {
          log.warn('Redis cache read error', { key, error });
          this.redisMisses++;
        }
      }

      // Layer 3: Fetch from source
      log.debug('Cache miss - fetching from source', { key });
      const value = await fetcher();

      // Store in cache layers
      await this.set(key, value, ttl, layer);

      timer.done('Cache miss - fetched from source', { key });
      return value;
    } catch (error) {
      log.error('Cache get error', error, { key });
      throw error;
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    ttl: number,
    layer: 'memory' | 'redis' | 'both' = 'both'
  ): Promise<void> {
    try {
      // Store in memory cache
      if (layer === 'memory' || layer === 'both') {
        const memoryTTL = Math.min(ttl, config.cache.memoryTTL || 10);
        memoryCache.set(key, value, memoryTTL);
      }

      // Store in Redis cache
      if ((layer === 'redis' || layer === 'both') && isRedisAvailable() && redis) {
        try {
          const serialized = JSON.stringify(value);
          await redis.setex(key, ttl, serialized);
          log.debug('Cache set - redis', { key, ttl });
        } catch (error) {
          log.warn('Redis cache write error', { key, error });
        }
      }
    } catch (error) {
      log.error('Cache set error', error, { key });
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    const timer = log.startTimer({ pattern, operation: 'cacheInvalidate' });

    try {
      // Invalidate memory cache
      const memoryDeleted = memoryCache.delPattern(pattern);
      log.debug('Memory cache invalidated', { pattern, deleted: memoryDeleted });

      // Invalidate Redis cache
      if (isRedisAvailable() && redis) {
        try {
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            await redis.del(...keys);
            log.debug('Redis cache invalidated', { pattern, deleted: keys.length });
          }
        } catch (error) {
          log.warn('Redis cache invalidation error', { pattern, error });
        }
      }

      timer.done('Cache invalidated', { pattern });
    } catch (error) {
      log.error('Cache invalidation error', error, { pattern });
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const memoryStats = memoryCache.getStats();
    const redisTotal = this.redisHits + this.redisMisses;
    const redisHitRate = redisTotal > 0 ? (this.redisHits / redisTotal) * 100 : 0;

    const totalHits = memoryStats.hits + this.redisHits;
    const totalRequests = memoryStats.hits + memoryStats.misses + this.redisHits + this.redisMisses;
    const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    return {
      memory: {
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hitRate,
        size: `${(memoryStats.size / (1024 * 1024)).toFixed(2)}MB`,
        keys: memoryStats.keys,
      },
      redis: {
        hits: this.redisHits,
        misses: this.redisMisses,
        hitRate: redisHitRate,
      },
      overall: {
        hitRate: overallHitRate,
      },
    };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    const timer = log.startTimer({ operation: 'cacheClear' });

    try {
      // Clear memory cache
      memoryCache.clear();

      // Clear Redis cache
      if (isRedisAvailable() && redis) {
        try {
          await redis.flushdb();
          log.info('Redis cache cleared');
        } catch (error) {
          log.warn('Redis cache clear error', { error });
        }
      }

      // Reset metrics
      this.redisHits = 0;
      this.redisMisses = 0;

      timer.done('All caches cleared');
    } catch (error) {
      log.error('Cache clear error', error);
    }
  }

  /**
   * Warm cache with a value
   * Used by cache warming job
   */
  async warm<T>(
    key: string,
    value: T,
    ttl: number,
    layer: 'memory' | 'redis' | 'both' = 'both'
  ): Promise<void> {
    await this.set(key, value, ttl, layer);
    log.debug('Cache warmed', { key, ttl, layer });
  }
}

// Export singleton instance
export const cacheService = new CacheService();
