import { describe, it, expect } from 'vitest';
import {
  calculatePriceImpact,
  calculateUnrealizedPnL,
  calculatePnLPercent,
  calculateLiquidationPrice,
  calculateVWAP,
} from '@/lib/utils/calculations';

describe('Calculations Utilities', () => {
  describe('calculatePriceImpact', () => {
    it('should calculate price impact correctly', () => {
      const orderSize = 10;
      const orderBookLevels = [
        { price: 100, volume: 5 },
        { price: 101, volume: 5 },
        { price: 102, volume: 10 },
      ];
      const currentPrice = 100;

      const impact = calculatePriceImpact(orderSize, orderBookLevels, currentPrice);
      expect(impact).toBeGreaterThan(0);
    });

    it('should return Infinity if not enough liquidity', () => {
      const orderSize = 100;
      const orderBookLevels = [
        { price: 100, volume: 5 },
        { price: 101, volume: 5 },
      ];
      const currentPrice = 100;

      const impact = calculatePriceImpact(orderSize, orderBookLevels, currentPrice);
      expect(impact).toBe(Infinity);
    });
  });

  describe('calculateUnrealizedPnL', () => {
    it('should calculate long position PnL correctly', () => {
      const pnl = calculateUnrealizedPnL(100, 110, 1, 'LONG');
      expect(pnl).toBe(10);
    });

    it('should calculate short position PnL correctly', () => {
      const pnl = calculateUnrealizedPnL(100, 90, 1, 'SHORT');
      expect(pnl).toBe(10);
    });
  });

  describe('calculatePnLPercent', () => {
    it('should calculate long position PnL percent correctly', () => {
      const pnlPercent = calculatePnLPercent(100, 110, 'LONG');
      expect(pnlPercent).toBe(10);
    });

    it('should calculate short position PnL percent correctly', () => {
      const pnlPercent = calculatePnLPercent(100, 90, 'SHORT');
      expect(pnlPercent).toBe(10);
    });
  });

  describe('calculateLiquidationPrice', () => {
    it('should calculate long liquidation price correctly', () => {
      const liqPrice = calculateLiquidationPrice(100, 10, 'LONG', 0.005);
      expect(liqPrice).toBeLessThan(100);
      expect(liqPrice).toBeGreaterThan(0);
    });

    it('should calculate short liquidation price correctly', () => {
      const liqPrice = calculateLiquidationPrice(100, 10, 'SHORT', 0.005);
      expect(liqPrice).toBeGreaterThan(100);
    });
  });

  describe('calculateVWAP', () => {
    it('should calculate VWAP correctly', () => {
      const trades = [
        { price: 100, size: 10 },
        { price: 105, size: 5 },
        { price: 95, size: 5 },
      ];

      const vwap = calculateVWAP(trades);
      expect(vwap).toBeCloseTo(100);
    });

    it('should return 0 for empty trades array', () => {
      const vwap = calculateVWAP([]);
      expect(vwap).toBe(0);
    });
  });
});
