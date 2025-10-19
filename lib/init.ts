/**
 * Application Initialization
 * 
 * Initialize services and start background jobs
 */

import { cacheWarmer } from '@/lib/jobs/cacheWarmer';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';
import { connectDatabase, isDatabaseAvailable } from '@/lib/database/client';
import { setupShutdownListeners } from '@/lib/core/shutdown';
import { 
  performDatabaseHealthCheck, 
  retryDatabaseConnection,
  verifyDatabaseConfig 
} from '@/lib/database/healthCheck';

/**
 * Initialize application services
 * Call this function on application startup
 */
export async function initializeApp(): Promise<void> {
  log.info('Initializing application services');

  try {
    // Setup graceful shutdown handlers
    setupShutdownListeners();

    // Verify database configuration
    const configCheck = verifyDatabaseConfig();
    if (!configCheck.valid) {
      log.warn('Database configuration issues detected', { errors: configCheck.errors });
      configCheck.errors.forEach(error => log.warn(`  - ${error}`));
    }

    // Connect to database with retry logic
    if (isDatabaseAvailable()) {
      log.info('Connecting to database');
      
      const connected = await retryDatabaseConnection(3, 2000);
      
      if (connected) {
        const health = await performDatabaseHealthCheck();
        log.info('Database health check completed', { 
          connected: health.connected,
          latency: health.latency 
        });
      } else {
        log.error('Failed to connect to database after retries');
        log.warn('Application will start but database features will be unavailable');
      }
    } else {
      log.warn('Database not configured, skipping connection');
    }

    // Start cache warming if enabled
    if (config.cache.warmOnStartup) {
      log.info('Cache warming enabled, scheduling cache warmer');
      cacheWarmer.scheduleWarming();
    } else {
      log.info('Cache warming disabled');
    }

    log.info('Application services initialized successfully');
  } catch (error) {
    log.error('Failed to initialize application services', error);
    throw error;
  }
}

/**
 * Cleanup application services
 * Call this function on application shutdown
 */
export async function cleanupApp(): Promise<void> {
  log.info('Cleaning up application services');

  try {
    // Stop cache warming
    cacheWarmer.stopScheduling();

    log.info('Application services cleaned up successfully');
  } catch (error) {
    log.error('Failed to cleanup application services', error);
  }
}
