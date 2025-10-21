/**
 * Whale Trade Configuration
 * 
 * Centralized configuration for whale trade tracking system
 */

import { WhaleThresholds, CategoryThresholds, WhaleTradeTrackerConfig } from '@/types/whale-trades';

/**
 * Asset-specific thresholds (minimum USD value to qualify as whale trade)
 */
export const WHALE_THRESHOLDS: WhaleThresholds = {
  BTC: 150000,  // $150k minimum for Bitcoin
  ETH: 75000,   // $75k minimum for Ethereum
  SOL: 25000,   // $25k minimum for Solana
  DEFAULT: 10000, // $10k minimum for all other assets
};

/**
 * Category thresholds (USD value ranges for categorization)
 */
export const CATEGORY_THRESHOLDS: CategoryThresholds = {
  MEGA_WHALE: 1000000,   // $1M+ trades
  WHALE: 200000,         // $200k+ trades
  INSTITUTION: 75000,    // $75k+ trades
  LARGE: 10000,          // $10k+ trades (falls back to asset threshold)
};

/**
 * Tracker configuration
 */
export const TRACKER_CONFIG: WhaleTradeTrackerConfig = {
  enabled: true,         // Enable whale trade tracking
  autoStart: true,       // Auto-start tracking on initialization
  batchSize: 10,         // Number of trades to batch before database write
  flushInterval: 10000,  // Flush interval in milliseconds (10 seconds)
  retentionDays: 30,     // Number of days to retain whale trades
};

/**
 * Category emojis for display
 */
export const CATEGORY_EMOJIS = {
  MEGA_WHALE: '🐋🐋',
  WHALE: '🐋',
  INSTITUTION: '🏦',
  LARGE: '💰',
} as const;

/**
 * Get threshold for a specific asset
 */
export function getAssetThreshold(asset: string): number {
  const upperAsset = asset.toUpperCase();
  return (WHALE_THRESHOLDS as any)[upperAsset] || WHALE_THRESHOLDS.DEFAULT;
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: string): string {
  return (CATEGORY_EMOJIS as any)[category] || '📊';
}

/**
 * Get all configuration
 */
export function getWhaleTradeConfig() {
  return {
    thresholds: WHALE_THRESHOLDS,
    categoryThresholds: CATEGORY_THRESHOLDS,
    tracker: TRACKER_CONFIG,
    emojis: CATEGORY_EMOJIS,
  };
}
