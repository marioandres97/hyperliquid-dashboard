import Redis from 'ioredis';

// Create Redis client with error handling
const createRedisClient = () => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL not configured, Redis features will be disabled');
    return null;
  }

  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true, // Don't connect immediately
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error.message);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('Redis ready to accept commands');
  });

  redis.on('close', () => {
    console.log('Redis connection closed');
  });

  return redis;
};

const redis = createRedisClient();

// Helper to check if Redis is available
export const isRedisAvailable = () => redis !== null;

export default redis;