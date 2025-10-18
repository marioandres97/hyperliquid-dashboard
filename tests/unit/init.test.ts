import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies
vi.mock('@/lib/jobs/cacheWarmer', () => ({
  cacheWarmer: {
    scheduleWarming: vi.fn(),
    stopScheduling: vi.fn(),
  },
}));

vi.mock('@/lib/core/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/core/config', () => ({
  config: {
    cache: {
      warmOnStartup: true,
    },
  },
}));

vi.mock('@/lib/database/client', () => ({
  connectDatabase: vi.fn(),
  isDatabaseAvailable: vi.fn(() => true),
}));

vi.mock('@/lib/core/shutdown', () => ({
  setupShutdownListeners: vi.fn(),
}));

describe('Application Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeApp', () => {
    it('should setup shutdown listeners', async () => {
      const { initializeApp } = await import('@/lib/init');
      const { setupShutdownListeners } = await import('@/lib/core/shutdown');

      await initializeApp();

      expect(setupShutdownListeners).toHaveBeenCalled();
    });

    it('should connect to database when available', async () => {
      const { initializeApp } = await import('@/lib/init');
      const { connectDatabase } = await import('@/lib/database/client');

      await initializeApp();

      expect(connectDatabase).toHaveBeenCalled();
    });

    it('should schedule cache warming when enabled', async () => {
      const { initializeApp } = await import('@/lib/init');
      const { cacheWarmer } = await import('@/lib/jobs/cacheWarmer');

      await initializeApp();

      expect(cacheWarmer.scheduleWarming).toHaveBeenCalled();
    });
  });

  describe('cleanupApp', () => {
    it('should stop cache warming', async () => {
      const { cleanupApp } = await import('@/lib/init');
      const { cacheWarmer } = await import('@/lib/jobs/cacheWarmer');

      await cleanupApp();

      expect(cacheWarmer.stopScheduling).toHaveBeenCalled();
    });

    it('should not throw errors on cleanup failure', async () => {
      const { cleanupApp } = await import('@/lib/init');
      const { cacheWarmer } = await import('@/lib/jobs/cacheWarmer');

      vi.mocked(cacheWarmer.stopScheduling).mockImplementation(() => {
        throw new Error('Cleanup error');
      });

      await expect(cleanupApp()).resolves.not.toThrow();
    });
  });
});
