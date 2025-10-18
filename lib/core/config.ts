/**
 * Configuration Management
 * 
 * Uses Zod to validate configuration from environment variables.
 * Fails fast on startup if configuration is invalid.
 */

import { z } from 'zod';

// Configuration schema
const configSchema = z.object({
  env: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.coerce.number().int().positive().default(3000),
  
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
  }),
  
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    pretty: z.coerce.boolean().default(false),
  }),
  
  features: z.object({
    rateLimitEnabled: z.coerce.boolean().default(true),
    analyticsEnabled: z.coerce.boolean().default(true),
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
    },
    
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      pretty: process.env.LOG_PRETTY || 'false',
    },
    
    features: {
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED || 'true',
      analyticsEnabled: process.env.ANALYTICS_ENABLED || 'true',
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
