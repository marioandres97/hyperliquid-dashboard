/**
 * Prisma Database Client
 * 
 * Singleton pattern for Prisma client to prevent multiple instances
 */
import { PrismaClient } from '@/lib/generated/prisma';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only initialize if database URL is provided
export const prisma = config.database.url
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log:
        config.env === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    })
  : null;

if (config.env !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
  return prisma !== null && config.database.url !== undefined;
}

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<void> {
  if (!isDatabaseAvailable() || !prisma) {
    log.warn('Database URL not configured, skipping connection');
    return;
  }

  try {
    await prisma.$connect();
    log.info('Database connected successfully');
  } catch (error) {
    log.error('Failed to connect to database', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (!isDatabaseAvailable() || !prisma) {
    return;
  }

  try {
    await prisma.$disconnect();
    log.info('Database disconnected successfully');
  } catch (error) {
    log.error('Failed to disconnect from database', error);
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<{
  available: boolean;
  connected: boolean;
  latency?: number;
}> {
  if (!isDatabaseAvailable() || !prisma) {
    return { available: false, connected: false };
  }

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    log.debug('Database health check passed', { latency });

    return {
      available: true,
      connected: true,
      latency,
    };
  } catch (error) {
    log.warn('Database health check failed', { error });
    return {
      available: true,
      connected: false,
    };
  }
}
