/**
 * Analytics Service
 * 
 * Handles analytics calculations and market metrics.
 */

import { calculateCVD, getCVDTrend, type CVDDataPoint } from '@/lib/utils/cvd';
import { log } from '@/lib/core/logger';
import { ValidationError } from '@/lib/core/errors';
import type { Trade } from './marketService';

export interface MarketMetrics {
  asset: string;
  cvd: number;
  cvdTrend: number;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  timestamp: number;
}

/**
 * Analytics Service Class
 */
export class AnalyticsService {
  /**
   * Calculate CVD (Cumulative Volume Delta) for an asset
   */
  calculateAssetCVD(
    trades: Trade[],
    asset: string,
    hours: number = 24
  ): CVDDataPoint[] {
    const timer = log.startTimer({ asset, hours, operation: 'calculateAssetCVD' });

    try {
      if (!trades || trades.length === 0) {
        log.warn('No trades provided for CVD calculation', { asset, hours });
        return [];
      }

      if (hours <= 0) {
        throw new ValidationError(
          'Hours must be greater than 0',
          { hours, asset }
        );
      }

      log.debug('Calculating CVD', { asset, hours, tradeCount: trades.length });

      const cvdData = calculateCVD(trades, hours);

      timer.done('CVD calculated successfully', {
        asset,
        hours,
        dataPoints: cvdData.length,
      });

      return cvdData;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      log.error('Failed to calculate CVD', error, { asset, hours });
      throw error;
    }
  }

  /**
   * Get comprehensive market metrics for an asset
   */
  getMarketMetrics(asset: string, trades: Trade[]): MarketMetrics {
    const timer = log.startTimer({ asset, operation: 'getMarketMetrics' });

    try {
      if (!trades || trades.length === 0) {
        log.warn('No trades provided for market metrics', { asset });
        return {
          asset,
          cvd: 0,
          cvdTrend: 0,
          totalVolume: 0,
          buyVolume: 0,
          sellVolume: 0,
          timestamp: Date.now(),
        };
      }

      log.debug('Calculating market metrics', {
        asset,
        tradeCount: trades.length,
      });

      // Calculate CVD
      const cvdData = calculateCVD(trades, 24);
      const cvd = cvdData.length > 0 ? cvdData[cvdData.length - 1].cvd : 0;
      const cvdTrend = getCVDTrend(cvdData);

      // Calculate volumes
      let buyVolume = 0;
      let sellVolume = 0;

      for (const trade of trades) {
        const volume = trade.size * trade.price;
        if (trade.side === 'BUY') {
          buyVolume += volume;
        } else {
          sellVolume += volume;
        }
      }

      const totalVolume = buyVolume + sellVolume;

      const metrics: MarketMetrics = {
        asset,
        cvd,
        cvdTrend,
        totalVolume,
        buyVolume,
        sellVolume,
        timestamp: Date.now(),
      };

      timer.done('Market metrics calculated successfully', {
        asset,
        cvd,
        cvdTrend,
        totalVolume,
      });

      return metrics;
    } catch (error) {
      log.error('Failed to calculate market metrics', error, { asset });
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
