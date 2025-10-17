// Utility functions for flow calculations and aggregations

import {
  ClassifiedTrade,
  ClassifiedLiquidation,
  LiquidityNode,
  FlowMetrics,
  FlowDirection,
  FlowTimePoint,
  FlowClassification,
  FlowSignal,
  Coin,
} from '../types';
import {
  normalizePriceToGrid,
  getWhaleTrades,
  calculateImbalance,
} from './classifiers';

/**
 * Create or update a liquidity node with a trade
 */
export function updateNodeWithTrade(
  node: LiquidityNode | undefined,
  trade: ClassifiedTrade,
  price: number
): LiquidityNode {
  const existing = node || {
    price,
    buyVolume: 0,
    sellVolume: 0,
    netFlow: 0,
    buyCount: 0,
    sellCount: 0,
    dominantSide: 'neutral' as const,
    whaleActivity: false,
    liquidations: 0,
    timestamp: trade.timestamp,
  };

  if (trade.side === 'buy') {
    existing.buyVolume += trade.size;
    existing.buyCount += 1;
  } else {
    existing.sellVolume += trade.size;
    existing.sellCount += 1;
  }

  existing.netFlow = existing.buyVolume - existing.sellVolume;
  existing.timestamp = trade.timestamp;
  
  // Update dominant side
  if (existing.buyVolume > existing.sellVolume * 1.2) {
    existing.dominantSide = 'buy';
  } else if (existing.sellVolume > existing.buyVolume * 1.2) {
    existing.dominantSide = 'sell';
  } else {
    existing.dominantSide = 'neutral';
  }
  
  // Track whale activity
  if (trade.classification.isWhale) {
    existing.whaleActivity = true;
  }

  return existing;
}

/**
 * Update a liquidity node with a liquidation
 */
export function updateNodeWithLiquidation(
  node: LiquidityNode | undefined,
  liquidation: ClassifiedLiquidation,
  price: number
): LiquidityNode {
  const existing = node || {
    price,
    buyVolume: 0,
    sellVolume: 0,
    netFlow: 0,
    buyCount: 0,
    sellCount: 0,
    dominantSide: 'neutral' as const,
    whaleActivity: false,
    liquidations: 0,
    timestamp: liquidation.timestamp,
  };

  existing.liquidations += 1;
  existing.timestamp = liquidation.timestamp;

  return existing;
}

/**
 * Aggregate trades into liquidity nodes
 */
export function aggregateTradesToNodes(
  trades: ClassifiedTrade[],
  priceGrouping: number
): Map<number, LiquidityNode> {
  const nodes = new Map<number, LiquidityNode>();

  trades.forEach(trade => {
    const normalizedPrice = normalizePriceToGrid(trade.price, priceGrouping);
    const node = nodes.get(normalizedPrice);
    const updatedNode = updateNodeWithTrade(node, trade, normalizedPrice);
    nodes.set(normalizedPrice, updatedNode);
  });

  return nodes;
}

/**
 * Add liquidations to existing nodes
 */
export function addLiquidationsToNodes(
  nodes: Map<number, LiquidityNode>,
  liquidations: ClassifiedLiquidation[],
  priceGrouping: number
): Map<number, LiquidityNode> {
  liquidations.forEach(liquidation => {
    const normalizedPrice = normalizePriceToGrid(liquidation.price, priceGrouping);
    const node = nodes.get(normalizedPrice);
    const updatedNode = updateNodeWithLiquidation(node, liquidation, normalizedPrice);
    nodes.set(normalizedPrice, updatedNode);
  });

  return nodes;
}

/**
 * Calculate comprehensive flow metrics
 */
export function calculateFlowMetrics(
  trades: ClassifiedTrade[],
  liquidations: ClassifiedLiquidation[],
  nodes: Map<number, LiquidityNode>
): FlowMetrics {
  // Initialize metrics
  let totalBuyVolume = 0;
  let totalSellVolume = 0;
  let totalBuyNotional = 0;
  let totalSellNotional = 0;
  let buyTradeCount = 0;
  let sellTradeCount = 0;
  
  // Whale metrics
  const whaleTrades = getWhaleTrades(trades);
  let whaleBuyVolume = 0;
  let whaleSellVolume = 0;
  
  // Liquidation metrics
  let longLiquidations = 0;
  let shortLiquidations = 0;
  let totalLiquidationVolume = 0;
  
  // Price tracking
  let highestBuyLevel: number | null = null;
  let highestSellLevel: number | null = null;
  let mostActivePrice: number | null = null;
  let maxActivity = 0;

  // Process trades
  trades.forEach(trade => {
    if (trade.side === 'buy') {
      totalBuyVolume += trade.size;
      totalBuyNotional += trade.notional;
      buyTradeCount += 1;
      if (highestBuyLevel === null || trade.price > highestBuyLevel) {
        highestBuyLevel = trade.price;
      }
    } else {
      totalSellVolume += trade.size;
      totalSellNotional += trade.notional;
      sellTradeCount += 1;
      if (highestSellLevel === null || trade.price > highestSellLevel) {
        highestSellLevel = trade.price;
      }
    }
  });

  // Process whale trades
  whaleTrades.forEach(trade => {
    if (trade.side === 'buy') {
      whaleBuyVolume += trade.size;
    } else {
      whaleSellVolume += trade.size;
    }
  });

  // Process liquidations
  liquidations.forEach(liq => {
    if (liq.side === 'long') {
      longLiquidations += 1;
    } else {
      shortLiquidations += 1;
    }
    totalLiquidationVolume += liq.size;
  });

  // Find most active price from nodes
  nodes.forEach((node, price) => {
    const activity = node.buyCount + node.sellCount;
    if (activity > maxActivity) {
      maxActivity = activity;
      mostActivePrice = price;
    }
  });

  // Calculate derived metrics
  const netFlow = totalBuyVolume - totalSellVolume;
  const whaleNetFlow = whaleBuyVolume - whaleSellVolume;
  const totalTrades = buyTradeCount + sellTradeCount;
  const avgTradeSize = totalTrades > 0 
    ? (totalBuyVolume + totalSellVolume) / totalTrades 
    : 0;

  // Determine flow direction
  let flowDirection: FlowDirection;
  const flowStrength = Math.abs(netFlow);
  const totalVolume = totalBuyVolume + totalSellVolume;
  const flowRatio = totalVolume > 0 ? flowStrength / totalVolume : 0;
  
  if (flowRatio < 0.1) {
    flowDirection = 'neutral';
  } else if (netFlow > 0) {
    flowDirection = 'inflow';
  } else {
    flowDirection = 'outflow';
  }

  // Calculate imbalances
  const volumeImbalance = calculateImbalance(totalBuyVolume, totalSellVolume);
  const tradeImbalance = calculateImbalance(buyTradeCount, sellTradeCount);
  const whaleImbalance = calculateImbalance(whaleBuyVolume, whaleSellVolume);

  return {
    totalBuyVolume,
    totalSellVolume,
    totalBuyNotional,
    totalSellNotional,
    netFlow,
    flowDirection,
    totalTrades,
    buyTradeCount,
    sellTradeCount,
    avgTradeSize,
    whaleTradeCount: whaleTrades.length,
    whaleBuyVolume,
    whaleSellVolume,
    whaleNetFlow,
    totalLiquidations: liquidations.length,
    longLiquidations,
    shortLiquidations,
    totalLiquidationVolume,
    highestBuyLevel,
    highestSellLevel,
    mostActivePrice,
    volumeImbalance,
    tradeImbalance,
    whaleImbalance,
  };
}

/**
 * Create time-series points from trades
 */
export function createTimeSeries(
  trades: ClassifiedTrade[],
  liquidations: ClassifiedLiquidation[],
  intervalMs: number
): FlowTimePoint[] {
  if (trades.length === 0) return [];

  const points: FlowTimePoint[] = [];
  const startTime = trades[0].timestamp;
  const endTime = trades[trades.length - 1].timestamp;
  
  for (let t = startTime; t <= endTime; t += intervalMs) {
    const windowEnd = t + intervalMs;
    
    const windowTrades = trades.filter(
      trade => trade.timestamp >= t && trade.timestamp < windowEnd
    );
    
    const windowLiqs = liquidations.filter(
      liq => liq.timestamp >= t && liq.timestamp < windowEnd
    );
    
    if (windowTrades.length === 0) continue;
    
    const buyVolume = windowTrades
      .filter(t => t.side === 'buy')
      .reduce((sum, t) => sum + t.size, 0);
    
    const sellVolume = windowTrades
      .filter(t => t.side === 'sell')
      .reduce((sum, t) => sum + t.size, 0);
    
    const whaleTrades = getWhaleTrades(windowTrades);
    const whaleBuyVol = whaleTrades
      .filter(t => t.side === 'buy')
      .reduce((sum, t) => sum + t.size, 0);
    const whaleSellVol = whaleTrades
      .filter(t => t.side === 'sell')
      .reduce((sum, t) => sum + t.size, 0);
    
    const liquidationVolume = windowLiqs.reduce((sum, liq) => sum + liq.size, 0);
    
    // Use last trade price in window
    const price = windowTrades[windowTrades.length - 1].price;
    
    points.push({
      timestamp: t,
      netFlow: buyVolume - sellVolume,
      buyVolume,
      sellVolume,
      whaleFlow: whaleBuyVol - whaleSellVol,
      liquidationVolume,
      price,
    });
  }
  
  return points;
}

/**
 * Classify flow direction and strength
 */
export function classifyFlow(
  metrics: FlowMetrics,
  timeSeries: FlowTimePoint[]
): FlowClassification {
  const signals: FlowSignal[] = [];
  
  // Detect whale accumulation/distribution
  if (metrics.whaleNetFlow > 0 && metrics.whaleTradeCount >= 3) {
    signals.push({
      type: 'whale_accumulation',
      strength: Math.min(100, Math.abs(metrics.whaleImbalance) * 100),
      description: `${metrics.whaleTradeCount} whale buys detected`,
      timestamp: Date.now(),
    });
  } else if (metrics.whaleNetFlow < 0 && metrics.whaleTradeCount >= 3) {
    signals.push({
      type: 'whale_distribution',
      strength: Math.min(100, Math.abs(metrics.whaleImbalance) * 100),
      description: `${metrics.whaleTradeCount} whale sells detected`,
      timestamp: Date.now(),
    });
  }
  
  // Detect liquidation cascade
  if (metrics.totalLiquidations >= 5) {
    signals.push({
      type: 'liquidation_cascade',
      strength: Math.min(100, metrics.totalLiquidations * 10),
      description: `${metrics.totalLiquidations} liquidations in window`,
      timestamp: Date.now(),
    });
  }
  
  // Detect aggressive buying/selling
  if (metrics.volumeImbalance > 0.5) {
    signals.push({
      type: 'aggressive_buying',
      strength: Math.min(100, metrics.volumeImbalance * 100),
      description: `Strong buy pressure: ${(metrics.volumeImbalance * 100).toFixed(1)}%`,
      timestamp: Date.now(),
    });
  } else if (metrics.volumeImbalance < -0.5) {
    signals.push({
      type: 'aggressive_selling',
      strength: Math.min(100, Math.abs(metrics.volumeImbalance) * 100),
      description: `Strong sell pressure: ${(Math.abs(metrics.volumeImbalance) * 100).toFixed(1)}%`,
      timestamp: Date.now(),
    });
  }
  
  // Balanced flow
  if (Math.abs(metrics.volumeImbalance) < 0.2) {
    signals.push({
      type: 'balanced_flow',
      strength: 50,
      description: 'Market showing balanced flow',
      timestamp: Date.now(),
    });
  }
  
  // Calculate overall strength and confidence
  const strength = signals.reduce((sum, s) => Math.max(sum, s.strength), 0);
  const confidence = Math.min(1, signals.length / 3); // more signals = higher confidence
  
  return {
    direction: metrics.flowDirection,
    strength,
    confidence,
    signals,
  };
}
