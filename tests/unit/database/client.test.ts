import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isDatabaseAvailable, checkDatabaseHealth } from '@/lib/database/client';

// Mock the config module
vi.mock('@/lib/core/config', () => ({
  config: {
    database: {
      url: undefined,
    },
    env: 'test',
  },
}));

describe('Database Client', () => {
  describe('isDatabaseAvailable', () => {
    it('should return false when database URL is not configured', () => {
      expect(isDatabaseAvailable()).toBe(false);
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return unavailable when database is not configured', async () => {
      const health = await checkDatabaseHealth();
      expect(health).toEqual({
        available: false,
        connected: false,
      });
    });
  });
});
