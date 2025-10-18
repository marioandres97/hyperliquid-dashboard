import { describe, it, expect } from 'vitest';
import { analyticsService } from '@/lib/services/analyticsService';
import type { Trade } from '@/lib/services/marketService';

describe('AnalyticsService', () => {
  // Use fixed timestamps relative to a recent time for consistent test results
  const baseTime = Date.now() - 60000; // 1 minute ago
  const mockTrades: Trade[] = [
    { timestamp: baseTime - 1000, side: 'BUY', size: 10, price: 100 },
    { timestamp: baseTime - 2000, side: 'SELL', size: 5, price: 101 },
    { timestamp: baseTime - 3000, side: 'BUY', size: 8, price: 99 },
    { timestamp: baseTime - 4000, side: 'SELL', size: 12, price: 102 },
  ];

  describe('calculateAssetCVD', () => {
    it('should calculate CVD for given trades', () => {
      const cvdData = analyticsService.calculateAssetCVD(mockTrades, 'BTC', 24);
      
      expect(cvdData).toBeInstanceOf(Array);
      expect(cvdData.length).toBeGreaterThan(0);
      expect(cvdData[0]).toHaveProperty('time');
      expect(cvdData[0]).toHaveProperty('cvd');
    });

    it('should return empty array for no trades', () => {
      const cvdData = analyticsService.calculateAssetCVD([], 'BTC', 24);
      expect(cvdData).toEqual([]);
    });

    it('should throw ValidationError for invalid hours', () => {
      expect(() => {
        analyticsService.calculateAssetCVD(mockTrades, 'BTC', 0);
      }).toThrow('Hours must be greater than 0');
    });
  });

  describe('getMarketMetrics', () => {
    it('should calculate market metrics from trades', () => {
      const metrics = analyticsService.getMarketMetrics('BTC', mockTrades);
      
      expect(metrics).toHaveProperty('asset', 'BTC');
      expect(metrics).toHaveProperty('cvd');
      expect(metrics).toHaveProperty('cvdTrend');
      expect(metrics).toHaveProperty('totalVolume');
      expect(metrics).toHaveProperty('buyVolume');
      expect(metrics).toHaveProperty('sellVolume');
      expect(metrics).toHaveProperty('timestamp');
      
      expect(typeof metrics.cvd).toBe('number');
      expect(typeof metrics.totalVolume).toBe('number');
    });

    it('should return zero metrics for no trades', () => {
      const metrics = analyticsService.getMarketMetrics('ETH', []);
      
      expect(metrics.cvd).toBe(0);
      expect(metrics.cvdTrend).toBe(0);
      expect(metrics.totalVolume).toBe(0);
      expect(metrics.buyVolume).toBe(0);
      expect(metrics.sellVolume).toBe(0);
    });

    it('should calculate buy and sell volumes correctly', () => {
      const metrics = analyticsService.getMarketMetrics('BTC', mockTrades);
      
      // Buy trades: 10 * 100 + 8 * 99 = 1792
      // Sell trades: 5 * 101 + 12 * 102 = 1729
      expect(metrics.buyVolume).toBeCloseTo(1792, 0);
      expect(metrics.sellVolume).toBeCloseTo(1729, 0);
      expect(metrics.totalVolume).toBeCloseTo(3521, 0);
    });
  });
});
