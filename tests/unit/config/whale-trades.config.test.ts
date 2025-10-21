import { describe, it, expect } from 'vitest';
import {
  WHALE_THRESHOLDS,
  CATEGORY_THRESHOLDS,
  TRACKER_CONFIG,
  CATEGORY_EMOJIS,
  getAssetThreshold,
  getCategoryEmoji,
  getWhaleTradeConfig,
} from '@/config/whale-trades.config';

describe('Whale Trades Config', () => {
  describe('WHALE_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(WHALE_THRESHOLDS.BTC).toBe(100000);
      expect(WHALE_THRESHOLDS.ETH).toBe(50000);
      expect(WHALE_THRESHOLDS.SOL).toBe(25000);
      expect(WHALE_THRESHOLDS.DEFAULT).toBe(10000);
    });

    it('should have all required assets', () => {
      expect(WHALE_THRESHOLDS).toHaveProperty('BTC');
      expect(WHALE_THRESHOLDS).toHaveProperty('ETH');
      expect(WHALE_THRESHOLDS).toHaveProperty('SOL');
      expect(WHALE_THRESHOLDS).toHaveProperty('DEFAULT');
    });
  });

  describe('CATEGORY_THRESHOLDS', () => {
    it('should have correct category threshold values', () => {
      expect(CATEGORY_THRESHOLDS.MEGA_WHALE).toBe(1000000);
      expect(CATEGORY_THRESHOLDS.WHALE).toBe(100000);
      expect(CATEGORY_THRESHOLDS.INSTITUTION).toBe(50000);
      expect(CATEGORY_THRESHOLDS.LARGE).toBe(10000);
    });

    it('should have all categories', () => {
      expect(CATEGORY_THRESHOLDS).toHaveProperty('MEGA_WHALE');
      expect(CATEGORY_THRESHOLDS).toHaveProperty('WHALE');
      expect(CATEGORY_THRESHOLDS).toHaveProperty('INSTITUTION');
      expect(CATEGORY_THRESHOLDS).toHaveProperty('LARGE');
    });

    it('should have descending order values', () => {
      expect(CATEGORY_THRESHOLDS.MEGA_WHALE).toBeGreaterThan(CATEGORY_THRESHOLDS.WHALE);
      expect(CATEGORY_THRESHOLDS.WHALE).toBeGreaterThan(CATEGORY_THRESHOLDS.INSTITUTION);
      expect(CATEGORY_THRESHOLDS.INSTITUTION).toBeGreaterThan(CATEGORY_THRESHOLDS.LARGE);
    });
  });

  describe('TRACKER_CONFIG', () => {
    it('should have correct tracker configuration', () => {
      expect(TRACKER_CONFIG.enabled).toBe(true);
      expect(TRACKER_CONFIG.autoStart).toBe(true);
      expect(TRACKER_CONFIG.batchSize).toBe(10);
      expect(TRACKER_CONFIG.flushInterval).toBe(5000);
      expect(TRACKER_CONFIG.retentionDays).toBe(30);
    });

    it('should have all required config properties', () => {
      expect(TRACKER_CONFIG).toHaveProperty('enabled');
      expect(TRACKER_CONFIG).toHaveProperty('autoStart');
      expect(TRACKER_CONFIG).toHaveProperty('batchSize');
      expect(TRACKER_CONFIG).toHaveProperty('flushInterval');
      expect(TRACKER_CONFIG).toHaveProperty('retentionDays');
    });

    it('should have valid numeric values', () => {
      expect(typeof TRACKER_CONFIG.batchSize).toBe('number');
      expect(typeof TRACKER_CONFIG.flushInterval).toBe('number');
      expect(typeof TRACKER_CONFIG.retentionDays).toBe('number');
      expect(TRACKER_CONFIG.batchSize).toBeGreaterThan(0);
      expect(TRACKER_CONFIG.flushInterval).toBeGreaterThan(0);
      expect(TRACKER_CONFIG.retentionDays).toBeGreaterThan(0);
    });
  });

  describe('CATEGORY_EMOJIS', () => {
    it('should have correct emoji values', () => {
      expect(CATEGORY_EMOJIS.MEGA_WHALE).toBe('🐋🐋');
      expect(CATEGORY_EMOJIS.WHALE).toBe('🐋');
      expect(CATEGORY_EMOJIS.INSTITUTION).toBe('🏦');
      expect(CATEGORY_EMOJIS.LARGE).toBe('💰');
    });

    it('should have emojis for all categories', () => {
      expect(CATEGORY_EMOJIS).toHaveProperty('MEGA_WHALE');
      expect(CATEGORY_EMOJIS).toHaveProperty('WHALE');
      expect(CATEGORY_EMOJIS).toHaveProperty('INSTITUTION');
      expect(CATEGORY_EMOJIS).toHaveProperty('LARGE');
    });
  });

  describe('getAssetThreshold', () => {
    it('should return correct threshold for BTC', () => {
      expect(getAssetThreshold('BTC')).toBe(100000);
      expect(getAssetThreshold('btc')).toBe(100000);
    });

    it('should return correct threshold for ETH', () => {
      expect(getAssetThreshold('ETH')).toBe(50000);
      expect(getAssetThreshold('eth')).toBe(50000);
    });

    it('should return correct threshold for SOL', () => {
      expect(getAssetThreshold('SOL')).toBe(25000);
      expect(getAssetThreshold('sol')).toBe(25000);
    });

    it('should return default threshold for unknown assets', () => {
      expect(getAssetThreshold('DOGE')).toBe(10000);
      expect(getAssetThreshold('AVAX')).toBe(10000);
      expect(getAssetThreshold('UNKNOWN')).toBe(10000);
    });

    it('should handle case-insensitive asset names', () => {
      expect(getAssetThreshold('BTC')).toBe(getAssetThreshold('btc'));
      expect(getAssetThreshold('ETH')).toBe(getAssetThreshold('eth'));
      expect(getAssetThreshold('SOL')).toBe(getAssetThreshold('sol'));
    });
  });

  describe('getCategoryEmoji', () => {
    it('should return correct emoji for MEGA_WHALE', () => {
      expect(getCategoryEmoji('MEGA_WHALE')).toBe('🐋🐋');
    });

    it('should return correct emoji for WHALE', () => {
      expect(getCategoryEmoji('WHALE')).toBe('🐋');
    });

    it('should return correct emoji for INSTITUTION', () => {
      expect(getCategoryEmoji('INSTITUTION')).toBe('🏦');
    });

    it('should return correct emoji for LARGE', () => {
      expect(getCategoryEmoji('LARGE')).toBe('💰');
    });

    it('should return default emoji for unknown category', () => {
      expect(getCategoryEmoji('UNKNOWN')).toBe('📊');
      expect(getCategoryEmoji('INVALID')).toBe('📊');
    });
  });

  describe('getWhaleTradeConfig', () => {
    it('should return complete configuration object', () => {
      const config = getWhaleTradeConfig();

      expect(config).toHaveProperty('thresholds');
      expect(config).toHaveProperty('categoryThresholds');
      expect(config).toHaveProperty('tracker');
      expect(config).toHaveProperty('emojis');
    });

    it('should return correct threshold values', () => {
      const config = getWhaleTradeConfig();

      expect(config.thresholds).toEqual(WHALE_THRESHOLDS);
      expect(config.categoryThresholds).toEqual(CATEGORY_THRESHOLDS);
      expect(config.tracker).toEqual(TRACKER_CONFIG);
      expect(config.emojis).toEqual(CATEGORY_EMOJIS);
    });

    it('should be immutable (returns new object)', () => {
      const config1 = getWhaleTradeConfig();
      const config2 = getWhaleTradeConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different object references
    });
  });

  describe('Configuration consistency', () => {
    it('should have BTC threshold greater than DEFAULT', () => {
      expect(WHALE_THRESHOLDS.BTC).toBeGreaterThan(WHALE_THRESHOLDS.DEFAULT);
    });

    it('should have ETH threshold greater than DEFAULT', () => {
      expect(WHALE_THRESHOLDS.ETH).toBeGreaterThan(WHALE_THRESHOLDS.DEFAULT);
    });

    it('should have SOL threshold greater than DEFAULT', () => {
      expect(WHALE_THRESHOLDS.SOL).toBeGreaterThan(WHALE_THRESHOLDS.DEFAULT);
    });

    it('should have LARGE category threshold equal to DEFAULT asset threshold', () => {
      expect(CATEGORY_THRESHOLDS.LARGE).toBe(WHALE_THRESHOLDS.DEFAULT);
    });

    it('should have WHALE category threshold equal to BTC asset threshold', () => {
      expect(CATEGORY_THRESHOLDS.WHALE).toBe(WHALE_THRESHOLDS.BTC);
    });
  });
});
