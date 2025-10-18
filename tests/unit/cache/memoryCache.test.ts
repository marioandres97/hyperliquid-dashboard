import { describe, it, expect, beforeEach } from 'vitest';
import { memoryCache } from '@/lib/cache/memoryCache';

describe('MemoryCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    memoryCache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      
      memoryCache.set(key, value);
      const retrieved = memoryCache.get(key);
      
      expect(retrieved).toEqual(value);
    });

    it('should return undefined for missing keys', () => {
      const retrieved = memoryCache.get('nonexistent-key');
      expect(retrieved).toBeUndefined();
    });

    it('should respect TTL', async () => {
      const key = 'ttl-test-key';
      const value = 'ttl-test-value';
      
      memoryCache.set(key, value, 1); // 1 second TTL
      
      // Should exist immediately
      expect(memoryCache.get(key)).toBe(value);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      expect(memoryCache.get(key)).toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete a key', () => {
      const key = 'delete-test-key';
      const value = 'delete-test-value';
      
      memoryCache.set(key, value);
      expect(memoryCache.get(key)).toBe(value);
      
      memoryCache.del(key);
      expect(memoryCache.get(key)).toBeUndefined();
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern', () => {
      memoryCache.set('user:1:profile', 'data1');
      memoryCache.set('user:2:profile', 'data2');
      memoryCache.set('user:3:settings', 'data3');
      memoryCache.set('admin:1:profile', 'data4');
      
      const deletedCount = memoryCache.delPattern('user:.*:profile');
      
      expect(deletedCount).toBe(2);
      expect(memoryCache.get('user:1:profile')).toBeUndefined();
      expect(memoryCache.get('user:2:profile')).toBeUndefined();
      expect(memoryCache.get('user:3:settings')).toBeDefined();
      expect(memoryCache.get('admin:1:profile')).toBeDefined();
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      memoryCache.set('key1', 'value1');
      memoryCache.set('key2', 'value2');
      memoryCache.set('key3', 'value3');
      
      memoryCache.clear();
      
      expect(memoryCache.get('key1')).toBeUndefined();
      expect(memoryCache.get('key2')).toBeUndefined();
      expect(memoryCache.get('key3')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should track hits and misses', () => {
      const key = 'stats-test-key';
      const value = 'stats-test-value';
      
      memoryCache.set(key, value);
      
      // Hit
      memoryCache.get(key);
      
      // Miss
      memoryCache.get('nonexistent-key');
      
      const stats = memoryCache.getStats();
      
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.hitRate).toBeLessThan(100);
    });

    it('should track number of keys', () => {
      memoryCache.set('key1', 'value1');
      memoryCache.set('key2', 'value2');
      
      const stats = memoryCache.getStats();
      expect(stats.keys).toBe(2);
    });

    it('should calculate hit rate correctly', () => {
      const key = 'rate-test-key';
      
      memoryCache.set(key, 'value');
      
      // 3 hits
      memoryCache.get(key);
      memoryCache.get(key);
      memoryCache.get(key);
      
      // 1 miss
      memoryCache.get('nonexistent-key');
      
      const stats = memoryCache.getStats();
      expect(stats.hitRate).toBeCloseTo(75, 0); // 3 hits / 4 total = 75%
    });
  });
});
