import { describe, it, expect } from 'vitest';
import { config, configSchema } from '@/lib/core/config';

describe('Config', () => {
  describe('config object', () => {
    it('should have env property', () => {
      expect(config).toHaveProperty('env');
      expect(['development', 'staging', 'production', 'test']).toContain(config.env);
    });

    it('should have port property', () => {
      expect(config).toHaveProperty('port');
      expect(typeof config.port).toBe('number');
      expect(config.port).toBeGreaterThan(0);
    });

    it('should have database configuration', () => {
      expect(config).toHaveProperty('database');
      expect(config.database).toHaveProperty('maxConnections');
      expect(config.database).toHaveProperty('connectionTimeout');
      expect(typeof config.database.maxConnections).toBe('number');
      expect(typeof config.database.connectionTimeout).toBe('number');
    });

    it('should have redis configuration', () => {
      expect(config).toHaveProperty('redis');
      expect(config.redis).toHaveProperty('maxRetries');
      expect(config.redis).toHaveProperty('connectTimeout');
    });

    it('should have hyperliquid configuration', () => {
      expect(config).toHaveProperty('hyperliquid');
      expect(config.hyperliquid).toHaveProperty('apiUrl');
      expect(config.hyperliquid).toHaveProperty('wsUrl');
      expect(config.hyperliquid).toHaveProperty('testnet');
    });

    it('should have cache configuration', () => {
      expect(config).toHaveProperty('cache');
      expect(config.cache).toHaveProperty('memoryEnabled');
      expect(config.cache).toHaveProperty('memoryTTL');
      expect(config.cache).toHaveProperty('redisTTL');
    });

    it('should have rate limit configuration', () => {
      expect(config).toHaveProperty('rateLimit');
      expect(config.rateLimit).toHaveProperty('enabled');
      expect(config.rateLimit).toHaveProperty('freeRequests');
      expect(config.rateLimit).toHaveProperty('proRequests');
    });

    it('should have logging configuration', () => {
      expect(config).toHaveProperty('logging');
      expect(config.logging).toHaveProperty('level');
      expect(['debug', 'info', 'warn', 'error']).toContain(config.logging.level);
    });

    it('should have features configuration', () => {
      expect(config).toHaveProperty('features');
      expect(config.features).toHaveProperty('rateLimitEnabled');
      expect(config.features).toHaveProperty('analyticsEnabled');
    });

    it('should have sentry configuration', () => {
      expect(config).toHaveProperty('sentry');
      expect(config.sentry).toHaveProperty('environment');
      expect(config.sentry).toHaveProperty('tracesSampleRate');
      expect(config.sentry).toHaveProperty('replaysSessionSampleRate');
      expect(config.sentry).toHaveProperty('replaysOnErrorSampleRate');
    });
  });

  describe('configSchema', () => {
    it('should validate correct configuration', () => {
      const validConfig = {
        env: 'development',
        port: '3000',
        database: {
          url: 'postgresql://localhost:5432/test',
          maxConnections: '10',
          connectionTimeout: '10000',
        },
        redis: {
          url: 'redis://localhost:6379',
          maxRetries: '3',
          connectTimeout: '10000',
          commandTimeout: '5000',
        },
        hyperliquid: {
          apiUrl: 'https://api.hyperliquid.xyz',
          wsUrl: 'wss://api.hyperliquid.xyz/ws',
          testnet: 'false',
          timeout: '5000',
        },
        cache: {
          tradesRetentionDays: '7',
          positionsRetentionDays: '30',
          alertsRetentionDays: '30',
          memoryEnabled: 'true',
          memoryMaxSize: '50',
          memoryTTL: '10',
          redisTTL: '30',
          warmOnStartup: 'true',
        },
        rateLimit: {
          enabled: 'true',
          freeRequests: '60',
          proRequests: '300',
          apiRequests: '1000',
          windowSeconds: '60',
        },
        logging: {
          level: 'info',
          pretty: 'false',
        },
        features: {
          rateLimitEnabled: 'true',
          analyticsEnabled: 'true',
        },
        sentry: {
          dsn: 'https://example.com',
          environment: 'test',
          tracesSampleRate: '0.1',
          replaysSessionSampleRate: '0.1',
          replaysOnErrorSampleRate: '1.0',
        },
      };

      const result = configSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should use default values for optional fields', () => {
      const minimalConfig = {
        env: 'test',
        port: '3000',
        database: {},
        redis: {},
        hyperliquid: {},
        cache: {},
        rateLimit: {},
        logging: {},
        features: {},
        sentry: {},
      };

      const result = configSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.port).toBe(3000);
        expect(result.data.redis.maxRetries).toBe(3);
        expect(result.data.cache.memoryEnabled).toBe(true);
      }
    });

    it('should validate sentry sample rates are between 0 and 1', () => {
      const invalidConfig = {
        sentry: {
          tracesSampleRate: '2.0', // Invalid: > 1
        },
      };

      const result = configSchema.shape.sentry.safeParse(invalidConfig.sentry);
      expect(result.success).toBe(false);
    });
  });
});
