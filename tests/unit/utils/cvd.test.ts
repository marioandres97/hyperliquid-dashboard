import { describe, it, expect } from 'vitest';
import { calculateCVD, getCVDTrend, formatCVDTime } from '@/lib/utils/cvd';

describe('CVD Utilities', () => {
  describe('calculateCVD', () => {
    it('should calculate CVD for buy orders', () => {
      const now = Date.now();
      const trades = [
        { side: 'BUY' as const, size: 2, price: 50000, timestamp: now },
        { side: 'BUY' as const, size: 4, price: 50100, timestamp: now + 1000 },
      ];

      const cvdData = calculateCVD(trades);
      expect(cvdData).toHaveLength(2);
      expect(cvdData[0].cvd).toBeGreaterThan(0);
      expect(cvdData[1].cvd).toBeGreaterThan(cvdData[0].cvd);
    });

    it('should calculate CVD for sell orders', () => {
      const now = Date.now();
      const trades = [
        { side: 'SELL' as const, size: 2, price: 50000, timestamp: now },
        { side: 'SELL' as const, size: 4, price: 50100, timestamp: now + 1000 },
      ];

      const cvdData = calculateCVD(trades);
      expect(cvdData).toHaveLength(2);
      expect(cvdData[0].cvd).toBeLessThan(0);
      expect(cvdData[1].cvd).toBeLessThan(cvdData[0].cvd);
    });

    it('should calculate CVD for mixed orders', () => {
      const now = Date.now();
      const trades = [
        { side: 'BUY' as const, size: 3, price: 50000, timestamp: now },
        { side: 'SELL' as const, size: 1, price: 50100, timestamp: now + 1000 },
        { side: 'BUY' as const, size: 1, price: 50200, timestamp: now + 2000 },
      ];

      const cvdData = calculateCVD(trades);
      expect(cvdData).toHaveLength(3);
      expect(cvdData[0].cvd).toBeGreaterThan(0);
    });

    it('should return empty array for empty trades', () => {
      const cvdData = calculateCVD([]);
      expect(cvdData).toEqual([]);
    });

    it('should filter trades by time period', () => {
      const now = Date.now();
      const yesterday = now - (25 * 60 * 60 * 1000); // 25 hours ago
      const trades = [
        { side: 'BUY' as const, size: 1, price: 50000, timestamp: yesterday },
        { side: 'BUY' as const, size: 1, price: 50000, timestamp: now },
      ];

      const cvdData = calculateCVD(trades, 24);
      expect(cvdData).toHaveLength(1); // Only recent trade included
    });
  });

  describe('getCVDTrend', () => {
    it('should return positive trend for increasing CVD', () => {
      const cvdData = [
        { time: 1, cvd: 100 },
        { time: 2, cvd: 150 },
        { time: 3, cvd: 200 },
      ];

      const trend = getCVDTrend(cvdData);
      expect(trend).toBe(100);
    });

    it('should return negative trend for decreasing CVD', () => {
      const cvdData = [
        { time: 1, cvd: 200 },
        { time: 2, cvd: 150 },
        { time: 3, cvd: 100 },
      ];

      const trend = getCVDTrend(cvdData);
      expect(trend).toBe(-100);
    });

    it('should return 0 for insufficient data', () => {
      const cvdData = [{ time: 1, cvd: 100 }];
      const trend = getCVDTrend(cvdData);
      expect(trend).toBe(0);
    });
  });

  describe('formatCVDTime', () => {
    it('should format timestamp to time string', () => {
      const timestamp = new Date('2024-01-01T12:30:00').getTime();
      const formatted = formatCVDTime(timestamp);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });
});
