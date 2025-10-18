/**
 * Configuration Management
 * 
 * Uses Zod to validate configuration from environment variables.
 * Fails fast on startup if configuration is invalid.
 */

import { z } from 'zod';

// Configuration schema
const configSchema = z.object({
  env: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(3000),
  
  database: z.object({
    url: z.string().optional(),
    maxConnections: z.coerce.number().int().positive().default(10),
    connectionTimeout: z.coerce.number().int().positive().default(10000),
  }),
  
  redis: z.object({
    url: z.string().optional(),
    maxRetries: z.coerce.number().int().positive().default(3),
    connectTimeout: z.coerce.number().int().positive().default(10000),
    commandTimeout: z.coerce.number().int().positive().default(5000),
  }),
  
  hyperliquid: z.object({
    apiUrl: z.string().url().default('https://api.hyperliquid.xyz'),
    wsUrl: z.string().url().default('wss://api.hyperliquid.xyz/ws'),
    testnet: z.coerce.boolean().default(false),
    timeout: z.coerce.number().int().positive().default(5000),
  }),
  
  cache: z.object({
    tradesRetentionDays: z.coerce.number().int().positive().default(7),
    positionsRetentionDays: z.coerce.number().int().positive().default(30),
    alertsRetentionDays: z.coerce.number().int().positive().default(30),
    memoryEnabled: z.coerce.boolean().default(true),
    memoryMaxSize: z.coerce.number().int().positive().default(50), // MB
    memoryTTL: z.coerce.number().int().positive().default(10), // seconds
    redisTTL: z.coerce.number().int().positive().default(30), // seconds
    warmOnStartup: z.coerce.boolean().default(true),
  }),
  
  rateLimit: z.object({
    enabled: z.coerce.boolean().default(true),
    freeRequests: z.coerce.number().int().positive().default(60),
    proRequests: z.coerce.number().int().positive().default(300),
    apiRequests: z.coerce.number().int().positive().default(1000),
    windowSeconds: z.coerce.number().int().positive().default(60),
  }),
  
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    pretty: z.coerce.boolean().default(false),
  }),
  
  features: z.object({
    rateLimitEnabled: z.coerce.boolean().default(true),
    analyticsEnabled: z.coerce.boolean().default(true),
  }),
  
  sentry: z.object({
    dsn: z.string().optional(),
    environment: z.string().optional(),
    tracesSampleRate: z.coerce.number().min(0).max(1).default(0.1),
    replaysSessionSampleRate: z.coerce.number().min(0).max(1).default(0.1),
    replaysOnErrorSampleRate: z.coerce.number().min(0).max(1).default(1.0),
  }),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Parse and validate configuration from environment variables
 */
function parseConfig(): Config {
  const rawConfig = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || '3000',
    
    database: {
      url: process.env.DATABASE_URL,
      maxConnections: process.env.DATABASE_MAX_CONNECTIONS || '10',
      connectionTimeout: process.env.DATABASE_CONNECTION_TIMEOUT || '10000',
    },
    
    redis: {
      url: process.env.REDIS_URL,
      maxRetries: process.env.REDIS_MAX_RETRIES || '3',
      connectTimeout: process.env.REDIS_CONNECT_TIMEOUT || '10000',
      commandTimeout: process.env.REDIS_COMMAND_TIMEOUT || '5000',
    },
    
    hyperliquid: {
      apiUrl: process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz',
      wsUrl: process.env.HYPERLIQUID_WS_URL || 'wss://api.hyperliquid.xyz/ws',
      testnet: process.env.HYPERLIQUID_TESTNET || 'false',
      timeout: process.env.HYPERLIQUID_TIMEOUT || '5000',
    },
    
    cache: {
      tradesRetentionDays: process.env.REDIS_TRADES_RETENTION || '7',
      positionsRetentionDays: process.env.REDIS_POSITIONS_RETENTION || '30',
      alertsRetentionDays: process.env.REDIS_ALERTS_RETENTION || '30',
      memoryEnabled: process.env.CACHE_MEMORY_ENABLED || 'true',
      memoryMaxSize: process.env.CACHE_MEMORY_MAX_SIZE || '50',
      memoryTTL: process.env.CACHE_MEMORY_TTL || '10',
      redisTTL: process.env.CACHE_REDIS_TTL || '30',
      warmOnStartup: process.env.CACHE_WARM_ON_STARTUP || 'true',
    },
    
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED || 'true',
      freeRequests: process.env.RATE_LIMIT_FREE_REQUESTS || '60',
      proRequests: process.env.RATE_LIMIT_PRO_REQUESTS || '300',
      apiRequests: process.env.RATE_LIMIT_API_REQUESTS || '1000',
      windowSeconds: process.env.RATE_LIMIT_WINDOW_SECONDS || '60',
    },
    
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      pretty: process.env.LOG_PRETTY || 'false',
    },
    
    features: {
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED || 'true',
      analyticsEnabled: process.env.ANALYTICS_ENABLED || 'true',
    },
    
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
      replaysSessionSampleRate: process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1',
      replaysOnErrorSampleRate: process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0',
    },
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      console.error(JSON.stringify(error.errors, null, 2));
      throw new Error('Invalid configuration. Please check your environment variables.');
    }
    throw error;
  }
}

// Parse configuration on module load (fail fast)
export const config = parseConfig();

// Export for testing
export { configSchema };
