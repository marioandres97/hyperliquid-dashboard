/**
 * Database Health Check Utility
 * 
 * Provides comprehensive health monitoring for database connections
 */

import { prisma, isDatabaseAvailable } from './client';
import { log } from '@/lib/core/logger';

export interface DatabaseHealthStatus {
  available: boolean;
  connected: boolean;
  latency?: number;
  error?: string;
}

/**
 * Perform a comprehensive database health check
 */
export async function performDatabaseHealthCheck(): Promise<DatabaseHealthStatus> {
  if (!isDatabaseAvailable() || !prisma) {
    return {
      available: false,
      connected: false,
      error: 'DATABASE_URL not configured',
    };
  }

  try {
    const start = Date.now();
    
    // Try to execute a simple query
    await prisma.$queryRaw`SELECT 1 as health`;
    
    const latency = Date.now() - start;

    log.debug('Database health check passed', { latency });

    return {
      available: true,
      connected: true,
      latency,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error('Database health check failed', { error: errorMessage });
    
    return {
      available: true,
      connected: false,
      error: errorMessage,
    };
  }
}

/**
 * Retry database connection with exponential backoff
 */
export async function retryDatabaseConnection(
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<boolean> {
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    log.info(`Database connection attempt ${attempt}/${maxRetries}`);

    const health = await performDatabaseHealthCheck();
    
    if (health.connected) {
      log.info('Database connection successful', { attempt, latency: health.latency });
      return true;
    }

    if (attempt < maxRetries) {
      log.warn(`Database connection failed, retrying in ${delay}ms`, {
        attempt,
        error: health.error,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  log.error('Database connection failed after all retries', { maxRetries });
  return false;
}

/**
 * Verify database environment configuration
 */
export function verifyDatabaseConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL environment variable is not set');
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
