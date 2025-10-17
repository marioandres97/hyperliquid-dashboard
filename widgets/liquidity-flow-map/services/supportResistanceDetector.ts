// Service to detect support and resistance levels

import {
  SupportResistanceLevel,
  ClassifiedTrade,
  LiquidityNode,
  Coin,
} from '../types';

/**
 * Configuration for S/R level detection
 */
export interface SRDetectorConfig {
  minTouches: number;        // Minimum touches to qualify as S/R
  touchThreshold: number;    // Price range % for considering a "touch"
  minVolume: number;         // Minimum volume at level
  lookbackPeriodMs: number;  // How far back to look for levels
  strengthDecay: number;     // How much strength decays over time (0-1)
}

const DEFAULT_CONFIG: Record<Coin, SRDetectorConfig> = {
  BTC: {
    minTouches: 3,
    touchThreshold: 0.002, // 0.2%
    minVolume: 50_000,
    lookbackPeriodMs: 3600000, // 1 hour
    strengthDecay: 0.1,
  },
  ETH: {
    minTouches: 3,
    touchThreshold: 0.002,
    minVolume: 40_000,
    lookbackPeriodMs: 3600000,
    strengthDecay: 0.1,
  },
  HYPE: {
    minTouches: 3,
    touchThreshold: 0.003,
    minVolume: 20_000,
    lookbackPeriodMs: 3600000,
    strengthDecay: 0.1,
  },
};

/**
 * Price touch event for S/R analysis
 */
interface PriceTouch {
  price: number;
  timestamp: number;
  volume: number;
  side: 'buy' | 'sell';
  bounced: boolean; // Did price bounce from this level?
}

/**
 * Detect support and resistance levels
 */
export function detectSupportResistanceLevels(
  trades: ClassifiedTrade[],
  nodes: Map<number, LiquidityNode>,
  coin: Coin,
  currentPrice: number,
  config?: Partial<SRDetectorConfig>
): SupportResistanceLevel[] {
  const cfg = { ...DEFAULT_CONFIG[coin], ...config };
  const levels: SupportResistanceLevel[] = [];
  
  // Get price touches from trades
  const touches = extractPriceTouches(trades, cfg);
  
  // Cluster touches into potential S/R levels
  const clusters = clusterTouches(touches, cfg.touchThreshold);
  
  // Analyze each cluster
  for (const cluster of clusters) {
    if (cluster.touches.length < cfg.minTouches) continue;

    const totalVolume = cluster.touches.reduce((sum, t) => sum + t.volume, 0);
    if (totalVolume < cfg.minVolume) continue;

    // Determine if support or resistance
    const type = cluster.price < currentPrice ? 'support' : 'resistance';

    // Calculate strength
    const strength = calculateLevelStrength(cluster, cfg, nodes);

    // Check if level has been breached
    const breached = checkIfBreached(cluster, trades, currentPrice);

    levels.push({
      id: `sr-${coin}-${cluster.price}-${Date.now()}`,
      price: cluster.price,
      type,
      strength,
      touchCount: cluster.touches.length,
      volume: totalVolume,
      firstTouch: cluster.touches[0].timestamp,
      lastTouch: cluster.touches[cluster.touches.length - 1].timestamp,
      isBreached: breached.isBreached,
      breachTimestamp: breached.timestamp,
    });
  }

  return levels.sort((a, b) => b.strength - a.strength);
}

/**
 * Extract price touches from trades
 */
function extractPriceTouches(
  trades: ClassifiedTrade[],
  config: SRDetectorConfig
): PriceTouch[] {
  const touches: PriceTouch[] = [];
  const now = Date.now();

  // Filter trades within lookback period
  const recentTrades = trades.filter(
    t => now - t.timestamp <= config.lookbackPeriodMs
  );

  // Identify local extremes (potential touches)
  for (let i = 1; i < recentTrades.length - 1; i++) {
    const prev = recentTrades[i - 1];
    const current = recentTrades[i];
    const next = recentTrades[i + 1];

    // Local high (potential resistance touch)
    if (current.price > prev.price && current.price > next.price) {
      touches.push({
        price: current.price,
        timestamp: current.timestamp,
        volume: current.notional,
        side: current.side,
        bounced: next.price < current.price,
      });
    }

    // Local low (potential support touch)
    if (current.price < prev.price && current.price < next.price) {
      touches.push({
        price: current.price,
        timestamp: current.timestamp,
        volume: current.notional,
        side: current.side,
        bounced: next.price > current.price,
      });
    }
  }

  return touches;
}

/**
 * Cluster touches into price levels
 */
function clusterTouches(
  touches: PriceTouch[],
  threshold: number
): Array<{ price: number; touches: PriceTouch[] }> {
  const clusters: Map<number, PriceTouch[]> = new Map();

  for (const touch of touches) {
    let foundCluster = false;

    // Try to add to existing cluster
    for (const [clusterPrice, clusterTouches] of clusters.entries()) {
      const range = clusterPrice * threshold;
      if (Math.abs(touch.price - clusterPrice) <= range) {
        clusterTouches.push(touch);
        foundCluster = true;
        break;
      }
    }

    // Create new cluster
    if (!foundCluster) {
      clusters.set(touch.price, [touch]);
    }
  }

  // Calculate weighted average price for each cluster
  return Array.from(clusters.values()).map(touches => {
    const totalVolume = touches.reduce((sum, t) => sum + t.volume, 0);
    const weightedPrice = touches.reduce(
      (sum, t) => sum + t.price * (t.volume / totalVolume),
      0
    );
    
    return {
      price: weightedPrice,
      touches: touches.sort((a, b) => a.timestamp - b.timestamp),
    };
  });
}

/**
 * Calculate strength of a S/R level
 */
function calculateLevelStrength(
  cluster: { price: number; touches: PriceTouch[] },
  config: SRDetectorConfig,
  nodes: Map<number, LiquidityNode>
): number {
  // Base strength from touch count
  const touchScore = Math.min(100, (cluster.touches.length / config.minTouches) * 30);

  // Volume score
  const totalVolume = cluster.touches.reduce((sum, t) => sum + t.volume, 0);
  const volumeScore = Math.min(100, (totalVolume / config.minVolume) * 30);

  // Bounce score (did price respect the level?)
  const bounceCount = cluster.touches.filter(t => t.bounced).length;
  const bounceScore = Math.min(100, (bounceCount / cluster.touches.length) * 20);

  // Liquidity at level score
  const node = findNodeAtPrice(nodes, cluster.price);
  const liquidityScore = node 
    ? Math.min(100, ((node.buyVolume + node.sellVolume) / config.minVolume) * 20)
    : 0;

  // Time decay - recent touches more important
  const now = Date.now();
  const avgAge = cluster.touches.reduce(
    (sum, t) => sum + (now - t.timestamp),
    0
  ) / cluster.touches.length;
  const ageHours = avgAge / (1000 * 60 * 60);
  const decayFactor = Math.max(0, 1 - (ageHours * config.strengthDecay));

  const baseStrength = (touchScore + volumeScore + bounceScore + liquidityScore) / 4;
  return Math.round(baseStrength * decayFactor);
}

/**
 * Find node at or near a price
 */
function findNodeAtPrice(
  nodes: Map<number, LiquidityNode>,
  price: number
): LiquidityNode | null {
  // Try exact match first
  if (nodes.has(price)) {
    return nodes.get(price)!;
  }

  // Find closest node within 0.5% range
  const range = price * 0.005;
  const nearbyNodes = Array.from(nodes.entries()).filter(
    ([p]) => Math.abs(p - price) <= range
  );

  if (nearbyNodes.length === 0) return null;

  // Return node with highest volume
  return nearbyNodes.sort((a, b) => {
    const volA = a[1].buyVolume + a[1].sellVolume;
    const volB = b[1].buyVolume + b[1].sellVolume;
    return volB - volA;
  })[0][1];
}

/**
 * Check if a level has been breached
 */
function checkIfBreached(
  cluster: { price: number; touches: PriceTouch[] },
  trades: ClassifiedTrade[],
  currentPrice: number
): { isBreached: boolean; timestamp?: number } {
  const lastTouch = cluster.touches[cluster.touches.length - 1];
  
  // Get trades after last touch
  const tradesAfterLastTouch = trades.filter(
    t => t.timestamp > lastTouch.timestamp
  );

  // Check if price moved significantly through level
  const breachThreshold = cluster.price * 0.005; // 0.5% breach
  
  for (const trade of tradesAfterLastTouch) {
    // For support: breach if price goes significantly below
    if (cluster.price < currentPrice && trade.price < cluster.price - breachThreshold) {
      return { isBreached: true, timestamp: trade.timestamp };
    }
    
    // For resistance: breach if price goes significantly above
    if (cluster.price > currentPrice && trade.price > cluster.price + breachThreshold) {
      return { isBreached: true, timestamp: trade.timestamp };
    }
  }

  return { isBreached: false };
}

/**
 * Update S/R level with new price data
 */
export function updateSRLevel(
  level: SupportResistanceLevel,
  newTrades: ClassifiedTrade[],
  currentPrice: number,
  config?: Partial<SRDetectorConfig>
): SupportResistanceLevel {
  const cfg = { ...DEFAULT_CONFIG['BTC' as Coin], ...config };
  
  // Check for new touches
  const touchRange = level.price * cfg.touchThreshold;
  const newTouches = newTrades.filter(
    t => Math.abs(t.price - level.price) <= touchRange &&
         t.timestamp > level.lastTouch
  );

  if (newTouches.length > 0) {
    const newVolume = newTouches.reduce((sum, t) => sum + t.notional, 0);
    return {
      ...level,
      touchCount: level.touchCount + newTouches.length,
      volume: level.volume + newVolume,
      lastTouch: newTouches[newTouches.length - 1].timestamp,
    };
  }

  // Check if breached
  if (!level.isBreached) {
    const breachCheck = checkIfBreached(
      { price: level.price, touches: [] },
      newTrades,
      currentPrice
    );
    
    if (breachCheck.isBreached) {
      return {
        ...level,
        isBreached: true,
        breachTimestamp: breachCheck.timestamp,
      };
    }
  }

  return level;
}

/**
 * Get nearest support level below current price
 */
export function getNearestSupport(
  levels: SupportResistanceLevel[],
  currentPrice: number
): SupportResistanceLevel | null {
  const supports = levels
    .filter(l => l.type === 'support' && l.price < currentPrice && !l.isBreached)
    .sort((a, b) => b.price - a.price); // Closest first

  return supports[0] || null;
}

/**
 * Get nearest resistance level above current price
 */
export function getNearestResistance(
  levels: SupportResistanceLevel[],
  currentPrice: number
): SupportResistanceLevel | null {
  const resistances = levels
    .filter(l => l.type === 'resistance' && l.price > currentPrice && !l.isBreached)
    .sort((a, b) => a.price - b.price); // Closest first

  return resistances[0] || null;
}
