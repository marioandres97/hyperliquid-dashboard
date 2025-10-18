/**
 * Cache Warmer
 * 
 * Background job to pre-populate cache with popular data
 */

import { marketService, type Asset } from '@/lib/services/marketService';
import { analyticsService } from '@/lib/services/analyticsService';
import { cacheService } from '@/lib/services/cacheService';
import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';

// Main assets to warm
const MAIN_ASSETS: Asset[] = ['BTC', 'ETH', 'HYPE'];

// Warming interval in milliseconds (5 minutes)
const WARMING_INTERVAL = 5 * 60 * 1000;

/**
 * Cache Warmer Class
 */
export class CacheWarmer {
  private intervalId: NodeJS.Timeout | null = null;
  private isWarming: boolean = false;

  /**
   * Warm cache for a specific asset
   */
  async warmAsset(asset: Asset): Promise<void> {
    const timer = log.startTimer({ asset, operation: 'warmAsset' });

    try {
      log.debug('Warming cache for asset', { asset });

      // Warm price data
      await marketService.getPrice(asset);
      log.debug('Price cached', { asset });

      // Warm trades data
      await marketService.getTrades(asset, 100);
      log.debug('Trades cached', { asset });

      // Warm CVD calculation
      const trades = await marketService.getTrades(asset, 100);
      await analyticsService.calculateAssetCVD(trades, asset, 24);
      log.debug('CVD cached', { asset });

      // Warm market metrics
      await analyticsService.getMarketMetrics(asset, trades);
      log.debug('Metrics cached', { asset });

      timer.done('Asset cache warmed', { asset });
    } catch (error) {
      log.error('Failed to warm cache for asset', error, { asset });
      // Continue warming other assets
    }
  }

  /**
   * Warm cache for all main assets
   */
  async warmAll(): Promise<void> {
    if (this.isWarming) {
      log.debug('Cache warming already in progress, skipping');
      return;
    }

    this.isWarming = true;
    const timer = log.startTimer({ operation: 'warmAll' });

    try {
      log.info('Starting cache warming', { assets: MAIN_ASSETS });

      // Warm assets in parallel for efficiency
      await Promise.allSettled(
        MAIN_ASSETS.map(asset => this.warmAsset(asset))
      );

      timer.done('Cache warming completed', {
        assets: MAIN_ASSETS,
        count: MAIN_ASSETS.length,
      });
    } catch (error) {
      log.error('Cache warming failed', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Schedule periodic cache warming
   */
  scheduleWarming(): void {
    if (this.intervalId) {
      log.warn('Cache warming already scheduled');
      return;
    }

    log.info('Scheduling cache warming', {
      intervalMinutes: WARMING_INTERVAL / 60000,
    });

    // Warm immediately on startup if configured
    if (config.cache.warmOnStartup) {
      log.info('Warming cache on startup');
      this.warmAll().catch(error => {
        log.error('Startup cache warming failed', error);
      });
    }

    // Schedule periodic warming
    this.intervalId = setInterval(() => {
      log.debug('Running scheduled cache warming');
      this.warmAll().catch(error => {
        log.error('Scheduled cache warming failed', error);
      });
    }, WARMING_INTERVAL);

    log.info('Cache warming scheduled');
  }

  /**
   * Stop scheduled cache warming
   */
  stopScheduling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log.info('Cache warming stopped');
    }
  }

  /**
   * Get warming status
   */
  getStatus(): { isWarming: boolean; isScheduled: boolean } {
    return {
      isWarming: this.isWarming,
      isScheduled: this.intervalId !== null,
    };
  }
}

// Export singleton instance
export const cacheWarmer = new CacheWarmer();
