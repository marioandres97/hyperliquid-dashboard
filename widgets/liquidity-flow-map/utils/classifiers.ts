// Utility functions for trade and liquidation classification

import {
  RawTrade,
  RawLiquidation,
  ClassifiedTrade,
  ClassifiedLiquidation,
  LiquidityLevel,
  Coin,
} from '../types';

/**
 * Thresholds for trade classification (in USD)
 */
export const TRADE_THRESHOLDS = {
  whale: {
    BTC: 1_000_000,
    ETH: 800_000,
    HYPE: 300_000,
  },
  large: {
    BTC: 500_000,
    ETH: 400_000,
    HYPE: 150_000,
  },
  medium: {
    BTC: 100_000,
    ETH: 80_000,
    HYPE: 30_000,
  },
  // below medium is considered small
};

/**
 * Classify trade size based on notional value
 */
export function classifyTradeLevel(coin: Coin, notional: number): LiquidityLevel {
  const thresholds = {
    whale: TRADE_THRESHOLDS.whale[coin],
    large: TRADE_THRESHOLDS.large[coin],
    medium: TRADE_THRESHOLDS.medium[coin],
  };

  if (notional >= thresholds.whale) return 'whale';
  if (notional >= thresholds.large) return 'large';
  if (notional >= thresholds.medium) return 'medium';
  return 'small';
}

/**
 * Determine if a trade is aggressive (taker) based on side
 * In Hyperliquid: 'B' = aggressive buy (taker), 'A' = aggressive sell (taker)
 */
export function isAggressiveTrade(side: 'B' | 'A'): boolean {
  // Both sides in the feed are aggressive/taker trades
  return true;
}

/**
 * Classify a raw trade into a structured format
 */
export function classifyTrade(raw: RawTrade): ClassifiedTrade {
  const price = parseFloat(raw.px);
  const size = parseFloat(raw.sz);
  const notional = price * size;
  const coin = raw.coin as Coin;
  
  const level = classifyTradeLevel(coin, notional);
  const isWhale = level === 'whale';
  const isAggressive = isAggressiveTrade(raw.side);

  return {
    coin,
    side: raw.side === 'B' ? 'buy' : 'sell',
    price,
    size,
    notional,
    timestamp: raw.time,
    hash: raw.hash,
    tid: raw.tid,
    classification: {
      level,
      isAggressive,
      isWhale,
    },
  };
}

/**
 * Classify liquidation severity based on size
 */
export function classifyLiquidationLevel(
  coin: Coin,
  notional: number
): LiquidityLevel {
  // Use same thresholds as trades
  return classifyTradeLevel(coin, notional);
}

/**
 * Assess cascade risk for a liquidation
 */
export function assessCascadeRisk(
  level: LiquidityLevel,
  price: number,
  recentLiquidations: ClassifiedLiquidation[]
): 'high' | 'medium' | 'low' {
  // Check for liquidations at similar price levels in recent history
  const priceRange = price * 0.001; // 0.1% range
  const recentWindow = Date.now() - 60000; // last minute
  
  const nearbyLiquidations = recentLiquidations.filter(
    liq =>
      liq.timestamp >= recentWindow &&
      Math.abs(liq.price - price) <= priceRange
  );

  // High cascade risk if multiple large liquidations nearby
  if (nearbyLiquidations.length >= 3 && level !== 'small') {
    return 'high';
  }
  
  if (nearbyLiquidations.length >= 2 || level === 'whale') {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Classify a raw liquidation
 */
export function classifyLiquidation(
  raw: RawLiquidation,
  recentLiquidations: ClassifiedLiquidation[] = []
): ClassifiedLiquidation {
  const price = parseFloat(raw.price);
  const size = parseFloat(raw.size);
  const notional = price * size;
  const coin = raw.coin as Coin;
  
  const level = classifyLiquidationLevel(coin, notional);
  const cascadeRisk = assessCascadeRisk(level, price, recentLiquidations);

  return {
    coin,
    side: raw.side,
    price,
    size,
    notional,
    timestamp: raw.time,
    liqId: raw.liqId,
    classification: {
      level,
      cascadeRisk,
    },
  };
}

/**
 * Normalize price to a grid level for aggregation
 */
export function normalizePriceToGrid(
  price: number,
  gridSize: number
): number {
  return Math.round(price / gridSize) * gridSize;
}

/**
 * Calculate volume-weighted average price
 */
export function calculateVWAP(
  trades: ClassifiedTrade[]
): number {
  if (trades.length === 0) return 0;
  
  let totalVolume = 0;
  let volumeWeightedSum = 0;
  
  trades.forEach(trade => {
    totalVolume += trade.size;
    volumeWeightedSum += trade.price * trade.size;
  });
  
  return totalVolume > 0 ? volumeWeightedSum / totalVolume : 0;
}

/**
 * Filter trades by time window
 */
export function filterTradesByTime(
  trades: ClassifiedTrade[],
  startTime: number,
  endTime: number
): ClassifiedTrade[] {
  return trades.filter(
    trade => trade.timestamp >= startTime && trade.timestamp < endTime
  );
}

/**
 * Filter liquidations by time window
 */
export function filterLiquidationsByTime(
  liquidations: ClassifiedLiquidation[],
  startTime: number,
  endTime: number
): ClassifiedLiquidation[] {
  return liquidations.filter(
    liq => liq.timestamp >= startTime && liq.timestamp < endTime
  );
}

/**
 * Get whale trades from a list
 */
export function getWhaleTrades(
  trades: ClassifiedTrade[]
): ClassifiedTrade[] {
  return trades.filter(trade => trade.classification.isWhale);
}

/**
 * Calculate imbalance ratio (-1 to 1)
 */
export function calculateImbalance(
  buyMetric: number,
  sellMetric: number
): number {
  const total = buyMetric + sellMetric;
  if (total === 0) return 0;
  
  return (buyMetric - sellMetric) / total;
}
