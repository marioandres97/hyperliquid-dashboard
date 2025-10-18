import Redis from 'ioredis';
import { config } from '@/lib/core/config';
import { log } from '@/lib/core/logger';

// Create Redis client with error handling
const createRedisClient = () => {
  if (!config.redis.url) {
    log.warn('REDIS_URL not configured, Redis features will be disabled');
    return null;
  }

  const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: config.redis.maxRetries,
    enableReadyCheck: true,
    connectTimeout: config.redis.connectTimeout,
    commandTimeout: config.redis.commandTimeout,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      log.debug('Redis retrying connection', { attempt: times, delay });
      return delay;
    },
    // Set lazyConnect based on environment
    lazyConnect: config.env !== 'production',
  });

  redis.on('error', (error) => {
    log.error('Redis connection error', error);
  });

  redis.on('connect', () => {
    log.info('Redis connected successfully');
  });

  redis.on('ready', () => {
    log.info('Redis ready to accept commands');
  });

  redis.on('close', () => {
    log.info('Redis connection closed');
  });

  redis.on('reconnecting', (delay: number) => {
    log.info('Redis reconnecting', { delay });
  });

  return redis;
};

const redis = createRedisClient();

// Helper to check if Redis is available
export const isRedisAvailable = () => redis !== null;

export default redis;