/**
 * Graceful Shutdown Handler
 * 
 * Handles cleanup of resources on application shutdown
 */
import { log } from './logger';
import { disconnectDatabase } from '@/lib/database/client';
import redis, { isRedisAvailable } from '@/lib/redis';
import { cleanupApp } from '@/lib/init';

type ShutdownHandler = () => Promise<void> | void;

const shutdownHandlers: ShutdownHandler[] = [];
let isShuttingDown = false;

/**
 * Register a shutdown handler
 */
export function registerShutdownHandler(handler: ShutdownHandler): void {
  shutdownHandlers.push(handler);
}

/**
 * Execute graceful shutdown
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    log.warn('Shutdown already in progress, ignoring signal', { signal });
    return;
  }

  isShuttingDown = true;
  log.info('Graceful shutdown initiated', { signal });

  try {
    // Run application cleanup
    await cleanupApp();

    // Disconnect from database
    log.info('Disconnecting from database');
    await disconnectDatabase();

    // Disconnect from Redis
    if (isRedisAvailable() && redis) {
      log.info('Disconnecting from Redis');
      await redis.quit();
    }

    // Run custom shutdown handlers
    log.info('Running custom shutdown handlers', { count: shutdownHandlers.length });
    for (const handler of shutdownHandlers) {
      try {
        await handler();
      } catch (error) {
        log.error('Shutdown handler failed', error);
      }
    }

    log.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    log.error('Error during graceful shutdown', error);
    process.exit(1);
  }
}

/**
 * Setup shutdown listeners
 */
export function setupShutdownListeners(): void {
  // Handle SIGTERM (e.g., from Docker or Kubernetes)
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle SIGINT (e.g., Ctrl+C)
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    log.error('Uncaught exception', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled rejection', { reason, promise });
    gracefulShutdown('unhandledRejection');
  });

  log.info('Shutdown listeners registered');
}
