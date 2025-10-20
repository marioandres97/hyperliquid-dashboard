import { describe, it, expect } from 'vitest';
import { calculatePnL, calculateMetrics, calculateCumulativePnL } from '@/lib/pnl-tracker/calculations';
import { Trade } from '@/types/pnl-tracker';

describe('PnL Tracker Calculations', () => {
  describe('calculatePnL', () => {
    it('should calculate PnL for a long position correctly', () => {
      const result = calculatePnL('long', 100, 110, 1, 0);
      expect(result).toEqual({
        pnl: 10,
        pnlPercent: 10
      });
    });

    it('should calculate PnL for a short position correctly', () => {
      const result = calculatePnL('short', 100, 90, 1, 0);
      expect(result).toEqual({
        pnl: 10,
        pnlPercent: 10
      });
    });

    it('should include fees in PnL calculation', () => {
      const result = calculatePnL('long', 100, 110, 1, 2);
      expect(result).toEqual({
        pnl: 8,
        pnlPercent: 8
      });
    });

    it('should handle negative PnL for long position', () => {
      const result = calculatePnL('long', 100, 90, 1, 0);
      expect(result).toEqual({
        pnl: -10,
        pnlPercent: -10
      });
    });

    it('should handle negative PnL for short position', () => {
      const result = calculatePnL('short', 100, 110, 1, 0);
      expect(result).toEqual({
        pnl: -10,
        pnlPercent: -10
      });
    });

    it('should return null if exitPrice is not provided', () => {
      const result = calculatePnL('long', 100, null, 1, 0);
      expect(result).toBeNull();
    });

    it('should use currentPrice if provided for open position', () => {
      const result = calculatePnL('long', 100, null, 1, 0, 105);
      expect(result).toEqual({
        pnl: 5,
        pnlPercent: 5
      });
    });
  });

  describe('calculateMetrics', () => {
    const mockTrades: Trade[] = [
      {
        id: '1',
        asset: 'BTC',
        baseAsset: 'USDT',
        type: 'long',
        entryPrice: 100,
        exitPrice: 110,
        size: 1,
        fees: 1,
        openedAt: '2024-01-01T00:00:00Z',
        closedAt: '2024-01-02T00:00:00Z',
        pnl: 9,
        pnlPercent: 9,
        notes: null,
        status: 'closed',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        asset: 'ETH',
        baseAsset: 'USDT',
        type: 'short',
        entryPrice: 50,
        exitPrice: 55,
        size: 2,
        fees: 1,
        openedAt: '2024-01-03T00:00:00Z',
        closedAt: '2024-01-04T00:00:00Z',
        pnl: -11,
        pnlPercent: -11,
        notes: null,
        status: 'closed',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      },
      {
        id: '3',
        asset: 'SOL',
        baseAsset: 'USDT',
        type: 'long',
        entryPrice: 20,
        exitPrice: null,
        size: 5,
        fees: 0,
        openedAt: '2024-01-05T00:00:00Z',
        closedAt: null,
        pnl: null,
        pnlPercent: null,
        notes: null,
        status: 'open',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z'
      }
    ];

    it('should calculate total PnL correctly', () => {
      const metrics = calculateMetrics(mockTrades);
      expect(metrics.totalPnL).toBe(-2); // 9 + (-11) = -2
    });

    it('should calculate win rate correctly', () => {
      const metrics = calculateMetrics(mockTrades);
      expect(metrics.winRate).toBe(50); // 1 win out of 2 closed trades
      expect(metrics.winningTrades).toBe(1);
      expect(metrics.losingTrades).toBe(1);
    });

    it('should count open positions correctly', () => {
      const metrics = calculateMetrics(mockTrades);
      expect(metrics.openPositions).toBe(1);
    });

    it('should calculate best and worst trades correctly', () => {
      const metrics = calculateMetrics(mockTrades);
      expect(metrics.bestTrade).toBe(9);
      expect(metrics.worstTrade).toBe(-11);
    });

    it('should calculate total fees paid correctly', () => {
      const metrics = calculateMetrics(mockTrades);
      expect(metrics.totalFeesPaid).toBe(2); // 1 + 1 + 0
    });

    it('should handle empty trades array', () => {
      const metrics = calculateMetrics([]);
      expect(metrics.totalPnL).toBe(0);
      expect(metrics.winRate).toBe(0);
      expect(metrics.openPositions).toBe(0);
    });
  });

  describe('calculateCumulativePnL', () => {
    const mockTrades: Trade[] = [
      {
        id: '1',
        asset: 'BTC',
        baseAsset: 'USDT',
        type: 'long',
        entryPrice: 100,
        exitPrice: 110,
        size: 1,
        fees: 0,
        openedAt: '2024-01-01T00:00:00Z',
        closedAt: '2024-01-02T00:00:00Z',
        pnl: 10,
        pnlPercent: 10,
        notes: null,
        status: 'closed',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        asset: 'ETH',
        baseAsset: 'USDT',
        type: 'short',
        entryPrice: 50,
        exitPrice: 45,
        size: 2,
        fees: 0,
        openedAt: '2024-01-03T00:00:00Z',
        closedAt: '2024-01-04T00:00:00Z',
        pnl: 10,
        pnlPercent: 10,
        notes: null,
        status: 'closed',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      }
    ];

    it('should calculate cumulative PnL correctly', () => {
      const cumulative = calculateCumulativePnL(mockTrades);
      expect(cumulative).toHaveLength(2);
      expect(cumulative[0].pnl).toBe(10);
      expect(cumulative[0].tradePnl).toBe(10);
      expect(cumulative[1].pnl).toBe(20);
      expect(cumulative[1].tradePnl).toBe(10);
    });

    it('should sort trades by close date', () => {
      const cumulative = calculateCumulativePnL(mockTrades);
      expect(new Date(cumulative[0].date).getTime()).toBeLessThan(
        new Date(cumulative[1].date).getTime()
      );
    });

    it('should only include closed trades', () => {
      const tradesWithOpen: Trade[] = [
        ...mockTrades,
        {
          id: '3',
          asset: 'SOL',
          baseAsset: 'USDT',
          type: 'long',
          entryPrice: 20,
          exitPrice: null,
          size: 5,
          fees: 0,
          openedAt: '2024-01-05T00:00:00Z',
          closedAt: null,
          pnl: null,
          pnlPercent: null,
          notes: null,
          status: 'open',
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z'
        }
      ];
      const cumulative = calculateCumulativePnL(tradesWithOpen);
      expect(cumulative).toHaveLength(2); // Should only have 2 closed trades
    });
  });
});
