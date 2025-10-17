// Service to detect absorption zones where large orders absorb market flow

import {
  AbsorptionZone,
  ClassifiedTrade,
  LiquidityNode,
  Coin,
} from '../types';

/**
 * Configuration for absorption zone detection
 */
export interface AbsorptionDetectorConfig {
  minVolume: number;        // Minimum volume to consider
  minTradeCount: number;    // Minimum trades at level
  priceRange: number;       // Price range % for zone (e.g., 0.001 = 0.1%)
  minStrength: number;      // Minimum strength threshold (0-100)
  whaleWeightMultiplier: number; // Multiplier for whale trades
}

const DEFAULT_CONFIG: Record<Coin, AbsorptionDetectorConfig> = {
  BTC: {
    minVolume: 100_000,
    minTradeCount: 5,
    priceRange: 0.001,
    minStrength: 30,
    whaleWeightMultiplier: 2.5,
  },
  ETH: {
    minVolume: 80_000,
    minTradeCount: 5,
    priceRange: 0.001,
    minStrength: 30,
    whaleWeightMultiplier: 2.5,
  },
  HYPE: {
    minVolume: 30_000,
    minTradeCount: 5,
    priceRange: 0.002,
    minStrength: 30,
    whaleWeightMultiplier: 2.5,
  },
};

/**
 * Detect absorption zones from liquidity nodes
 */
export function detectAbsorptionZones(
  nodes: Map<number, LiquidityNode>,
  trades: ClassifiedTrade[],
  coin: Coin,
  config?: Partial<AbsorptionDetectorConfig>
): AbsorptionZone[] {
  const cfg = { ...DEFAULT_CONFIG[coin], ...config };
  const zones: AbsorptionZone[] = [];
  const processedPrices = new Set<number>();

  // Sort nodes by volume
  const sortedNodes = Array.from(nodes.entries())
    .sort((a, b) => {
      const volA = Math.max(a[1].buyVolume, a[1].sellVolume);
      const volB = Math.max(b[1].buyVolume, b[1].sellVolume);
      return volB - volA;
    });

  for (const [price, node] of sortedNodes) {
    if (processedPrices.has(price)) continue;

    // Determine dominant side
    const side = node.buyVolume > node.sellVolume ? 'buy' : 'sell';
    const volume = side === 'buy' ? node.buyVolume : node.sellVolume;
    const tradeCount = side === 'buy' ? node.buyCount : node.sellCount;

    // Check if meets minimum criteria
    if (volume < cfg.minVolume || tradeCount < cfg.minTradeCount) {
      continue;
    }

    // Find nearby nodes to form a zone
    const rangeSize = price * cfg.priceRange;
    const minPrice = price - rangeSize;
    const maxPrice = price + rangeSize;

    const zoneNodes = Array.from(nodes.entries()).filter(
      ([p]) => p >= minPrice && p <= maxPrice && !processedPrices.has(p)
    );

    // Calculate zone metrics
    let totalVolume = 0;
    let totalTrades = 0;
    let hasWhaleActivity = false;

    zoneNodes.forEach(([p, n]) => {
      const nodeVol = side === 'buy' ? n.buyVolume : n.sellVolume;
      const nodeTrades = side === 'buy' ? n.buyCount : n.sellCount;
      totalVolume += nodeVol;
      totalTrades += nodeTrades;
      if (n.whaleActivity) hasWhaleActivity = true;
      processedPrices.add(p);
    });

    // Apply whale multiplier
    const adjustedVolume = hasWhaleActivity 
      ? totalVolume * cfg.whaleWeightMultiplier 
      : totalVolume;

    // Calculate strength (0-100)
    const volumeScore = Math.min(100, (adjustedVolume / cfg.minVolume) * 20);
    const tradeCountScore = Math.min(100, (totalTrades / cfg.minTradeCount) * 20);
    const whaleBonus = hasWhaleActivity ? 20 : 0;
    const strength = Math.min(100, (volumeScore + tradeCountScore + whaleBonus) / 2);

    if (strength >= cfg.minStrength) {
      zones.push({
        id: `abs-${coin}-${price}-${Date.now()}`,
        price,
        priceRange: [minPrice, maxPrice],
        volume: totalVolume,
        side,
        strength,
        timestamp: Date.now(),
        tradeCount: totalTrades,
        whaleActivity: hasWhaleActivity,
        status: 'active',
      });
    }
  }

  return zones.sort((a, b) => b.strength - a.strength);
}

/**
 * Update absorption zone status based on price action
 */
export function updateAbsorptionZoneStatus(
  zone: AbsorptionZone,
  currentPrice: number,
  recentTrades: ClassifiedTrade[]
): AbsorptionZone {
  const [minPrice, maxPrice] = zone.priceRange;

  // Check if price breached the zone
  if (zone.side === 'buy' && currentPrice < minPrice) {
    return { ...zone, status: 'breached' };
  }
  if (zone.side === 'sell' && currentPrice > maxPrice) {
    return { ...zone, status: 'breached' };
  }

  // Check if zone is being tested (price within range)
  if (currentPrice >= minPrice && currentPrice <= maxPrice) {
    // Count recent trades in the zone
    const recentZoneTrades = recentTrades.filter(
      t => t.price >= minPrice && t.price <= maxPrice
    );

    // If significant volume absorbed, mark as absorbed
    const recentVolume = recentZoneTrades.reduce(
      (sum, t) => sum + (t.side === zone.side ? t.size : 0),
      0
    );

    if (recentVolume > zone.volume * 0.5) {
      return { ...zone, status: 'absorbed' };
    }
  }

  return zone;
}

/**
 * Get active absorption zones
 */
export function getActiveAbsorptionZones(
  zones: AbsorptionZone[]
): AbsorptionZone[] {
  return zones.filter(z => z.status === 'active');
}

/**
 * Find absorption zone at a specific price
 */
export function findAbsorptionZoneAtPrice(
  zones: AbsorptionZone[],
  price: number
): AbsorptionZone | null {
  return (
    zones.find(z => {
      const [min, max] = z.priceRange;
      return price >= min && price <= max && z.status === 'active';
    }) || null
  );
}