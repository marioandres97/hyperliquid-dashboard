/**
 * Application Initialization
 * 
 * Initialize services and start background jobs
 */

import { cacheWarmer } from '@/lib/jobs/cacheWarmer';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';

/**
 * Initialize application services
 * Call this function on application startup
 */
export async function initializeApp(): Promise<void> {
  log.info('Initializing application services');

  try {
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
