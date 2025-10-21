/**
 * Whale Trade Tracker Service
 * 
 * Monitors and categorizes whale trades based on configurable thresholds
 */
import { whaleTradeRepository, WhaleTradeCategory, CreateWhaleTradeInput } from '@/lib/database/repositories/whaleTrade.repository';
import { log } from '@/lib/core/logger';

// Asset-specific thresholds (USD)
export const WHALE_THRESHOLDS = {
  BTC: 100000,  // $100k
  ETH: 50000,   // $50k
  SOL: 25000,   // $25k
  DEFAULT: 10000, // $10k for all other assets
} as const;

// Category thresholds (USD)
export const CATEGORY_THRESHOLDS = {
  MEGA_WHALE: 1000000,   // $1M+
  WHALE: 100000,         // $100k+
  INSTITUTION: 50000,    // $50k+
  LARGE: 10000,          // $10k+
} as const;

export interface TradeData {
  asset: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  timestamp?: Date;
  tradeId?: string;
  priceImpact?: number;
  metadata?: any;
}

export interface WhaleTradeResult {
  isWhaleTrade: boolean;
  category?: WhaleTradeCategory;
  notionalValue: number;
  threshold: number;
  stored: boolean;
  tradeId?: string;
}

/**
 * Get threshold for a specific asset
 */
export function getAssetThreshold(asset: string): number {
  const upperAsset = asset.toUpperCase();
  return (WHALE_THRESHOLDS as any)[upperAsset] || WHALE_THRESHOLDS.DEFAULT;
}

/**
 * Determine whale trade category based on notional value
 */
export function categorizeWhaleTrace(notionalValue: number): WhaleTradeCategory {
  if (notionalValue >= CATEGORY_THRESHOLDS.MEGA_WHALE) {
    return WhaleTradeCategory.MEGA_WHALE;
  } else if (notionalValue >= CATEGORY_THRESHOLDS.WHALE) {
    return WhaleTradeCategory.WHALE;
  } else if (notionalValue >= CATEGORY_THRESHOLDS.INSTITUTION) {
    return WhaleTradeCategory.INSTITUTION;
  } else {
    return WhaleTradeCategory.LARGE;
  }
}

/**
 * Check if a trade qualifies as a whale trade
 */
export function isWhaleTrade(asset: string, notionalValue: number): boolean {
  const threshold = getAssetThreshold(asset);
  return notionalValue >= threshold;
}

/**
 * Process and track a trade
 */
export async function trackTrade(tradeData: TradeData): Promise<WhaleTradeResult> {
  const notionalValue = tradeData.price * tradeData.size;
  const threshold = getAssetThreshold(tradeData.asset);
  
  // Check if trade qualifies as whale trade
  if (!isWhaleTrade(tradeData.asset, notionalValue)) {
    return {
      isWhaleTrade: false,
      notionalValue,
      threshold,
      stored: false,
    };
  }

  // Categorize the whale trade
  const category = categorizeWhaleTrace(notionalValue);

  // Prepare whale trade data
  const whaleTradeData: CreateWhaleTradeInput = {
    asset: tradeData.asset,
    side: tradeData.side,
    price: tradeData.price,
    size: tradeData.size,
    notionalValue,
    category,
    timestamp: tradeData.timestamp,
    tradeId: tradeData.tradeId,
    priceImpact: tradeData.priceImpact,
    metadata: tradeData.metadata,
  };

  try {
    // Store whale trade in database
    const storedTrade = await whaleTradeRepository.create(whaleTradeData);
    
    log.info('Whale trade tracked', {
      asset: tradeData.asset,
      category,
      notionalValue,
      side: tradeData.side,
      tradeId: storedTrade.id,
    });

    return {
      isWhaleTrade: true,
      category,
      notionalValue,
      threshold,
      stored: true,
      tradeId: storedTrade.id,
    };
  } catch (error) {
    log.error('Failed to store whale trade', error);
    
    return {
      isWhaleTrade: true,
      category,
      notionalValue,
      threshold,
      stored: false,
    };
  }
}

/**
 * Batch process multiple trades
 */
export async function trackTrades(trades: TradeData[]): Promise<WhaleTradeResult[]> {
  const results: WhaleTradeResult[] = [];

  for (const trade of trades) {
    const result = await trackTrade(trade);
    results.push(result);
  }

  return results;
}

/**
 * Get threshold information for all assets
 */
export function getThresholdInfo() {
  return {
    assetThresholds: WHALE_THRESHOLDS,
    categoryThresholds: CATEGORY_THRESHOLDS,
    categories: Object.values(WhaleTradeCategory),
  };
}

/**
 * Format whale trade for display
 */
export function formatWhaleTrade(trade: {
  asset: string;
  side: string;
  notionalValue: number;
  category: WhaleTradeCategory;
}): string {
  const value = formatValue(trade.notionalValue);
  const emoji = getCategoryEmoji(trade.category);
  return `${emoji} ${trade.category}: ${trade.side} ${trade.asset} - ${value}`;
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: WhaleTradeCategory): string {
  switch (category) {
    case WhaleTradeCategory.MEGA_WHALE:
      return '🐋🐋';
    case WhaleTradeCategory.WHALE:
      return '🐋';
    case WhaleTradeCategory.INSTITUTION:
      return '🏦';
    case WhaleTradeCategory.LARGE:
      return '💰';
    default:
      return '📊';
  }
}

/**
 * Format value for display
 */
function formatValue(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Get whale trades summary for a time period
 */
export async function getWhaleTradesSummary(hours: number = 24) {
  try {
    const trades = await whaleTradeRepository.getRecent(hours);
    
    const summary = {
      totalTrades: trades.length,
      totalVolume: trades.reduce((sum, t) => sum + t.notionalValue, 0),
      avgTradeSize: 0,
      byCategory: {
        [WhaleTradeCategory.MEGA_WHALE]: 0,
        [WhaleTradeCategory.WHALE]: 0,
        [WhaleTradeCategory.INSTITUTION]: 0,
        [WhaleTradeCategory.LARGE]: 0,
      },
      byAsset: {} as Record<string, number>,
      bySide: {
        BUY: 0,
        SELL: 0,
      },
    };

    if (summary.totalTrades > 0) {
      summary.avgTradeSize = summary.totalVolume / summary.totalTrades;
    }

    trades.forEach(trade => {
      summary.byCategory[trade.category as WhaleTradeCategory]++;
      summary.byAsset[trade.asset] = (summary.byAsset[trade.asset] || 0) + 1;
      if (trade.side === 'BUY') {
        summary.bySide.BUY++;
      } else {
        summary.bySide.SELL++;
      }
    });

    return summary;
  } catch (error) {
    log.error('Error getting whale trades summary', error);
    return null;
  }
}

export const whaleTradeTracker = {
  trackTrade,
  trackTrades,
  isWhaleTrade,
  getAssetThreshold,
  categorizeWhaleTrace,
  getThresholdInfo,
  formatWhaleTrade,
  getWhaleTradesSummary,
};
