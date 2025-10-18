/**
 * Memory Cache Implementation
 * 
 * Simple in-memory LRU cache with TTL support
 * Uses node-cache library for efficient caching
 */

import NodeCache from 'node-cache';
import { log } from '@/lib/core/logger';

export interface MemoryCacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  keys: number;
}

/**
 * Memory Cache Class
 * Wrapper around node-cache with metrics tracking
 */
export class MemoryCache {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;
  private maxSizeMB: number;

  constructor(maxSizeMB: number = 50, ttlSeconds: number = 10) {
    this.maxSizeMB = maxSizeMB;
    
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false, // Better performance, be careful with mutations
      maxKeys: 1000, // Reasonable limit
    });

    // Log cache events
    this.cache.on('set', (key: string) => {
      log.debug('Memory cache set', { key });
    });

    this.cache.on('del', (key: string) => {
      log.debug('Memory cache delete', { key });
    });

    this.cache.on('expired', (key: string) => {
      log.debug('Memory cache key expired', { key });
    });

    log.info('Memory cache initialized', {
      maxSizeMB,
      ttlSeconds,
    });
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.hits++;
      log.debug('Memory cache hit', { key });
      return value;
    }
    
    this.misses++;
    log.debug('Memory cache miss', { key });
    return undefined;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: any, ttl?: number): boolean {
    try {
      // Check approximate size before setting
      const estimatedSize = this.estimateSize(value);
      const currentSize = this.getSize();
      
      if (currentSize + estimatedSize > this.maxSizeMB * 1024 * 1024) {
        log.warn('Memory cache size limit reached, evicting oldest entries', {
          currentSizeMB: currentSize / (1024 * 1024),
          maxSizeMB: this.maxSizeMB,
        });
        
        // Evict oldest entries (simple LRU)
        const keys = this.cache.keys();
        if (keys.length > 0) {
          this.cache.del(keys[0]);
        }
      }

      const success = this.cache.set(key, value, ttl || 0);
      
      if (success) {
        log.debug('Memory cache set successful', { key, ttl });
      } else {
        log.warn('Memory cache set failed', { key, ttl });
      }
      
      return success;
    } catch (error) {
      log.error('Memory cache set error', error, { key });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  del(key: string): void {
    this.cache.del(key);
    log.debug('Memory cache delete', { key });
  }

  /**
   * Delete multiple keys by pattern
   */
  delPattern(pattern: string): number {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    let deletedCount = 0;
    
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.del(key);
        deletedCount++;
      }
    }
    
    log.debug('Memory cache pattern delete', { pattern, deletedCount });
    return deletedCount;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
    log.info('Memory cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): MemoryCacheStats {
    const keys = this.cache.keys();
    const size = this.getSize();
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      size,
      keys: keys.length,
    };
  }

  /**
   * Estimate size of cache in bytes
   */
  private getSize(): number {
    const keys = this.cache.keys();
    let totalSize = 0;
    
    for (const key of keys) {
      const value = this.cache.get(key);
      totalSize += this.estimateSize(value);
    }
    
    return totalSize;
  }

  /**
   * Estimate size of a value in bytes
   */
  private estimateSize(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    
    try {
      const str = JSON.stringify(value);
      return str.length * 2; // Rough estimate: 2 bytes per character in UTF-16
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const memoryCache = new MemoryCache();
