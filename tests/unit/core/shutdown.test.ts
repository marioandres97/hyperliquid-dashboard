import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerShutdownHandler, setupShutdownListeners } from '@/lib/core/shutdown';

// Mock dependencies
vi.mock('@/lib/core/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/database/client', () => ({
  disconnectDatabase: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
  default: null,
  isRedisAvailable: () => false,
}));

vi.mock('@/lib/init', () => ({
  cleanupApp: vi.fn(),
}));

describe('Shutdown Handler', () => {
  describe('registerShutdownHandler', () => {
    it('should register a shutdown handler', () => {
      const handler = vi.fn();
      expect(() => registerShutdownHandler(handler)).not.toThrow();
    });
  });

  describe('setupShutdownListeners', () => {
    beforeEach(() => {
      // Clear all listeners before each test
      process.removeAllListeners('SIGTERM');
      process.removeAllListeners('SIGINT');
      process.removeAllListeners('uncaughtException');
      process.removeAllListeners('unhandledRejection');
    });

    it('should setup shutdown listeners', () => {
      const sigtermListenersBefore = process.listenerCount('SIGTERM');
      const sigintListenersBefore = process.listenerCount('SIGINT');

      setupShutdownListeners();

      const sigtermListenersAfter = process.listenerCount('SIGTERM');
      const sigintListenersAfter = process.listenerCount('SIGINT');

      expect(sigtermListenersAfter).toBeGreaterThan(sigtermListenersBefore);
      expect(sigintListenersAfter).toBeGreaterThan(sigintListenersBefore);
    });

    it('should setup uncaught exception listener', () => {
      const listenersBefore = process.listenerCount('uncaughtException');
      setupShutdownListeners();
      const listenersAfter = process.listenerCount('uncaughtException');
      expect(listenersAfter).toBeGreaterThan(listenersBefore);
    });

    it('should setup unhandled rejection listener', () => {
      const listenersBefore = process.listenerCount('unhandledRejection');
      setupShutdownListeners();
      const listenersAfter = process.listenerCount('unhandledRejection');
      expect(listenersAfter).toBeGreaterThan(listenersBefore);
    });
  });
});
