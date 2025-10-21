import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  whaleTradeTracker,
  getAssetThreshold,
  categorizeWhaleTrace,
  isWhaleTrade,
  WHALE_THRESHOLDS,
  CATEGORY_THRESHOLDS,
} from '@/lib/services/whaleTradeTracker';
import { WhaleTradeCategory } from '@/lib/database/repositories/whaleTrade.repository';

// Mock dependencies
vi.mock('@/lib/core/logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/database/repositories/whaleTrade.repository', () => {
  const mockCreate = vi.fn();
  const mockGetRecent = vi.fn();
  
  return {
    WhaleTradeCategory: {
      MEGA_WHALE: 'MEGA_WHALE',
      WHALE: 'WHALE',
      INSTITUTION: 'INSTITUTION',
      LARGE: 'LARGE',
    },
    whaleTradeRepository: {
      create: mockCreate,
      getRecent: mockGetRecent,
    },
  };
});

describe('WhaleTradeTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssetThreshold', () => {
    it('should return BTC threshold for BTC', () => {
      expect(getAssetThreshold('BTC')).toBe(WHALE_THRESHOLDS.BTC);
      expect(getAssetThreshold('BTC')).toBe(100000);
    });

    it('should return ETH threshold for ETH', () => {
      expect(getAssetThreshold('ETH')).toBe(WHALE_THRESHOLDS.ETH);
      expect(getAssetThreshold('ETH')).toBe(50000);
    });

    it('should return SOL threshold for SOL', () => {
      expect(getAssetThreshold('SOL')).toBe(WHALE_THRESHOLDS.SOL);
      expect(getAssetThreshold('SOL')).toBe(25000);
    });

    it('should return default threshold for unknown assets', () => {
      expect(getAssetThreshold('DOGE')).toBe(WHALE_THRESHOLDS.DEFAULT);
      expect(getAssetThreshold('AVAX')).toBe(10000);
    });

    it('should be case insensitive', () => {
      expect(getAssetThreshold('btc')).toBe(100000);
      expect(getAssetThreshold('eth')).toBe(50000);
      expect(getAssetThreshold('sol')).toBe(25000);
    });
  });

  describe('categorizeWhaleTrace', () => {
    it('should categorize as MEGA_WHALE for $1M+', () => {
      expect(categorizeWhaleTrace(1000000)).toBe(WhaleTradeCategory.MEGA_WHALE);
      expect(categorizeWhaleTrace(5000000)).toBe(WhaleTradeCategory.MEGA_WHALE);
    });

    it('should categorize as WHALE for $100k-$1M', () => {
      expect(categorizeWhaleTrace(100000)).toBe(WhaleTradeCategory.WHALE);
      expect(categorizeWhaleTrace(500000)).toBe(WhaleTradeCategory.WHALE);
      expect(categorizeWhaleTrace(999999)).toBe(WhaleTradeCategory.WHALE);
    });

    it('should categorize as INSTITUTION for $50k-$100k', () => {
      expect(categorizeWhaleTrace(50000)).toBe(WhaleTradeCategory.INSTITUTION);
      expect(categorizeWhaleTrace(75000)).toBe(WhaleTradeCategory.INSTITUTION);
      expect(categorizeWhaleTrace(99999)).toBe(WhaleTradeCategory.INSTITUTION);
    });

    it('should categorize as LARGE for $10k-$50k', () => {
      expect(categorizeWhaleTrace(10000)).toBe(WhaleTradeCategory.LARGE);
      expect(categorizeWhaleTrace(25000)).toBe(WhaleTradeCategory.LARGE);
      expect(categorizeWhaleTrace(49999)).toBe(WhaleTradeCategory.LARGE);
    });
  });

  describe('isWhaleTrade', () => {
    it('should return true for BTC trades >= $100k', () => {
      expect(isWhaleTrade('BTC', 100000)).toBe(true);
      expect(isWhaleTrade('BTC', 150000)).toBe(true);
      expect(isWhaleTrade('BTC', 1000000)).toBe(true);
    });

    it('should return false for BTC trades < $100k', () => {
      expect(isWhaleTrade('BTC', 99999)).toBe(false);
      expect(isWhaleTrade('BTC', 50000)).toBe(false);
      expect(isWhaleTrade('BTC', 10000)).toBe(false);
    });

    it('should return true for ETH trades >= $50k', () => {
      expect(isWhaleTrade('ETH', 50000)).toBe(true);
      expect(isWhaleTrade('ETH', 100000)).toBe(true);
    });

    it('should return false for ETH trades < $50k', () => {
      expect(isWhaleTrade('ETH', 49999)).toBe(false);
      expect(isWhaleTrade('ETH', 25000)).toBe(false);
    });

    it('should return true for SOL trades >= $25k', () => {
      expect(isWhaleTrade('SOL', 25000)).toBe(true);
      expect(isWhaleTrade('SOL', 50000)).toBe(true);
    });

    it('should return false for SOL trades < $25k', () => {
      expect(isWhaleTrade('SOL', 24999)).toBe(false);
      expect(isWhaleTrade('SOL', 10000)).toBe(false);
    });

    it('should use default threshold for unknown assets', () => {
      expect(isWhaleTrade('DOGE', 10000)).toBe(true);
      expect(isWhaleTrade('DOGE', 9999)).toBe(false);
    });
  });

  describe('trackTrade', () => {
    it('should not store trades below threshold', async () => {
      const { whaleTradeRepository } = await import('@/lib/database/repositories/whaleTrade.repository');
      
      const result = await whaleTradeTracker.trackTrade({
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 1,
      });

      expect(result.isWhaleTrade).toBe(false);
      expect(result.stored).toBe(false);
      expect(result.notionalValue).toBe(50000);
      expect(result.threshold).toBe(100000);
      expect(whaleTradeRepository.create).not.toHaveBeenCalled();
    });

    it('should store BTC trades above $100k threshold', async () => {
      const { whaleTradeRepository } = await import('@/lib/database/repositories/whaleTrade.repository');
      const mockTrade = {
        id: 'test-id',
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 3,
        notionalValue: 150000,
        category: WhaleTradeCategory.WHALE,
        exchange: 'Hyperliquid',
        timestamp: new Date(),
        createdAt: new Date(),
      };
      
      (whaleTradeRepository.create as any).mockResolvedValue(mockTrade);

      const result = await whaleTradeTracker.trackTrade({
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 3,
      });

      expect(result.isWhaleTrade).toBe(true);
      expect(result.stored).toBe(true);
      expect(result.category).toBe(WhaleTradeCategory.WHALE);
      expect(result.notionalValue).toBe(150000);
      expect(result.tradeId).toBe('test-id');
      expect(whaleTradeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: 'BTC',
          side: 'BUY',
          price: 50000,
          size: 3,
          notionalValue: 150000,
          category: WhaleTradeCategory.WHALE,
        })
      );
    });

    it('should categorize as MEGA_WHALE for $1M+ trades', async () => {
      const { whaleTradeRepository } = await import('@/lib/database/repositories/whaleTrade.repository');
      const mockTrade = {
        id: 'mega-id',
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 25,
        notionalValue: 1250000,
        category: WhaleTradeCategory.MEGA_WHALE,
        exchange: 'Hyperliquid',
        timestamp: new Date(),
        createdAt: new Date(),
      };
      
      (whaleTradeRepository.create as any).mockResolvedValue(mockTrade);

      const result = await whaleTradeTracker.trackTrade({
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 25,
      });

      expect(result.isWhaleTrade).toBe(true);
      expect(result.stored).toBe(true);
      expect(result.category).toBe(WhaleTradeCategory.MEGA_WHALE);
      expect(result.notionalValue).toBe(1250000);
    });

    it('should handle ETH trades with $50k threshold', async () => {
      const { whaleTradeRepository } = await import('@/lib/database/repositories/whaleTrade.repository');
      const mockTrade = {
        id: 'eth-id',
        asset: 'ETH',
        side: 'SELL',
        price: 2500,
        size: 25,
        notionalValue: 62500,
        category: WhaleTradeCategory.INSTITUTION,
        exchange: 'Hyperliquid',
        timestamp: new Date(),
        createdAt: new Date(),
      };
      
      (whaleTradeRepository.create as any).mockResolvedValue(mockTrade);

      const result = await whaleTradeTracker.trackTrade({
        asset: 'ETH',
        side: 'SELL',
        price: 2500,
        size: 25,
      });

      expect(result.isWhaleTrade).toBe(true);
      expect(result.stored).toBe(true);
      expect(result.category).toBe(WhaleTradeCategory.INSTITUTION);
      expect(result.threshold).toBe(50000);
    });

    it('should include optional metadata', async () => {
      const { whaleTradeRepository } = await import('@/lib/database/repositories/whaleTrade.repository');
      const mockTrade = {
        id: 'meta-id',
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 3,
        notionalValue: 150000,
        category: WhaleTradeCategory.WHALE,
        exchange: 'Hyperliquid',
        timestamp: new Date(),
        tradeId: 'external-123',
        priceImpact: 0.5,
        metadata: { source: 'test' },
        createdAt: new Date(),
      };
      
      (whaleTradeRepository.create as any).mockResolvedValue(mockTrade);

      const result = await whaleTradeTracker.trackTrade({
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 3,
        tradeId: 'external-123',
        priceImpact: 0.5,
        metadata: { source: 'test' },
      });

      expect(result.stored).toBe(true);
      expect(whaleTradeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tradeId: 'external-123',
          priceImpact: 0.5,
          metadata: { source: 'test' },
        })
      );
    });
  });

  describe('trackTrades', () => {
    it('should process multiple trades', async () => {
      const { whaleTradeRepository } = await import('@/lib/database/repositories/whaleTrade.repository');
      
      const trades = [
        { asset: 'BTC', side: 'BUY' as const, price: 50000, size: 3 },
        { asset: 'ETH', side: 'SELL' as const, price: 2500, size: 25 },
        { asset: 'BTC', side: 'BUY' as const, price: 50000, size: 1 }, // Below threshold
      ];

      (whaleTradeRepository.create as any).mockResolvedValue({
        id: 'test-id',
        asset: 'BTC',
        side: 'BUY',
        price: 50000,
        size: 3,
        notionalValue: 150000,
        category: WhaleTradeCategory.WHALE,
        exchange: 'Hyperliquid',
        timestamp: new Date(),
        createdAt: new Date(),
      });

      const results = await whaleTradeTracker.trackTrades(trades);

      expect(results).toHaveLength(3);
      expect(results[0].isWhaleTrade).toBe(true);
      expect(results[1].isWhaleTrade).toBe(true);
      expect(results[2].isWhaleTrade).toBe(false);
      expect(whaleTradeRepository.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getThresholdInfo', () => {
    it('should return threshold information', () => {
      const info = whaleTradeTracker.getThresholdInfo();

      expect(info.assetThresholds).toEqual(WHALE_THRESHOLDS);
      expect(info.categoryThresholds).toEqual(CATEGORY_THRESHOLDS);
      expect(info.categories).toContain(WhaleTradeCategory.MEGA_WHALE);
      expect(info.categories).toContain(WhaleTradeCategory.WHALE);
      expect(info.categories).toContain(WhaleTradeCategory.INSTITUTION);
      expect(info.categories).toContain(WhaleTradeCategory.LARGE);
    });
  });

  describe('formatWhaleTrade', () => {
    it('should format MEGA_WHALE trades', () => {
      const formatted = whaleTradeTracker.formatWhaleTrade({
        asset: 'BTC',
        side: 'BUY',
        notionalValue: 1500000,
        category: WhaleTradeCategory.MEGA_WHALE,
      });

      expect(formatted).toContain('🐋🐋');
      expect(formatted).toContain('MEGA_WHALE');
      expect(formatted).toContain('BUY');
      expect(formatted).toContain('BTC');
      expect(formatted).toContain('$1.50M');
    });

    it('should format WHALE trades', () => {
      const formatted = whaleTradeTracker.formatWhaleTrade({
        asset: 'ETH',
        side: 'SELL',
        notionalValue: 250000,
        category: WhaleTradeCategory.WHALE,
      });

      expect(formatted).toContain('🐋');
      expect(formatted).toContain('WHALE');
      expect(formatted).toContain('SELL');
      expect(formatted).toContain('ETH');
      expect(formatted).toContain('$250.0K');
    });

    it('should format INSTITUTION trades', () => {
      const formatted = whaleTradeTracker.formatWhaleTrade({
        asset: 'SOL',
        side: 'BUY',
        notionalValue: 75000,
        category: WhaleTradeCategory.INSTITUTION,
      });

      expect(formatted).toContain('🏦');
      expect(formatted).toContain('INSTITUTION');
      expect(formatted).toContain('BUY');
      expect(formatted).toContain('SOL');
      expect(formatted).toContain('$75.0K');
    });

    it('should format LARGE trades', () => {
      const formatted = whaleTradeTracker.formatWhaleTrade({
        asset: 'DOGE',
        side: 'BUY',
        notionalValue: 15000,
        category: WhaleTradeCategory.LARGE,
      });

      expect(formatted).toContain('💰');
      expect(formatted).toContain('LARGE');
      expect(formatted).toContain('BUY');
      expect(formatted).toContain('DOGE');
      expect(formatted).toContain('$15.0K');
    });
  });
});
