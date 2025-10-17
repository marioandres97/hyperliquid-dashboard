// Service to calculate liquidation cascade risks

import {
  LiquidationCascade,
  ClassifiedLiquidation,
  ClassifiedTrade,
  Coin,
} from '../types';

/**
 * Configuration for cascade risk calculation
 */
export interface CascadeCalculatorConfig {
  minLiquidations: number;   // Minimum liquidations to consider cascade
  priceClusterRange: number;  // Price range % for clustering (e.g., 0.002 = 0.2%)
  timeWindowMs: number;       // Time window for recent liquidations
  minVolume: number;          // Minimum volume to flag as cascade
  cascadeDepth: number;       // How many price levels to analyze
}

const DEFAULT_CONFIG: Record<Coin, CascadeCalculatorConfig> = {
  BTC: {
    minLiquidations: 3,
    priceClusterRange: 0.002,
    timeWindowMs: 300000, // 5 minutes
    minVolume: 50_000,
    cascadeDepth: 5,
  },
  ETH: {
    minLiquidations: 3,
    priceClusterRange: 0.002,
    timeWindowMs: 300000,
    minVolume: 40_000,
    cascadeDepth: 5,
  },
  HYPE: {
    minLiquidations: 3,
    priceClusterRange: 0.003,
    timeWindowMs: 300000,
    minVolume: 20_000,
    cascadeDepth: 5,
  },
};

/**
 * Calculate liquidation cascade risks
 */
export function calculateLiquidationCascades(
  liquidations: ClassifiedLiquidation[],
  coin: Coin,
  currentPrice: number,
  config?: Partial<CascadeCalculatorConfig>
): LiquidationCascade[] {
  const cfg = { ...DEFAULT_CONFIG[coin], ...config };
  const cascades: LiquidationCascade[] = [];
  
  // Filter recent liquidations
  const now = Date.now();
  const recentLiquidations = liquidations.filter(
    l => now - l.timestamp <= cfg.timeWindowMs
  );

  if (recentLiquidations.length < cfg.minLiquidations) {
    return cascades;
  }

  // Group liquidations by price clusters
  const clusters = clusterLiquidationsByPrice(
    recentLiquidations,
    cfg.priceClusterRange
  );

  // Analyze each cluster
  for (const cluster of clusters) {
    const { price, liquidations: clusterLiqs } = cluster;
    
    if (clusterLiqs.length < cfg.minLiquidations) continue;

    // Calculate total volume
    const totalVolume = clusterLiqs.reduce((sum, l) => sum + l.notional, 0);
    
    if (totalVolume < cfg.minVolume) continue;

    // Determine dominant side
    const longLiqs = clusterLiqs.filter(l => l.side === 'long').length;
    const shortLiqs = clusterLiqs.filter(l => l.side === 'short').length;
    const side = longLiqs > shortLiqs ? 'long' : 'short';

    // Assess risk level
    const risk = assessCascadeRiskLevel(
      clusterLiqs.length,
      totalVolume,
      cfg,
      clusterLiqs
    );

    // Find affected levels
    const affectedLevels = findAffectedLevels(
      price,
      side,
      currentPrice,
      cfg.cascadeDepth
    );

    // Estimate trigger price
    const triggerPrice = side === 'long' 
      ? price * 0.99  // 1% below for long cascades
      : price * 1.01; // 1% above for short cascades

    cascades.push({
      id: `cascade-${coin}-${price}-${now}`,
      priceLevel: price,
      risk,
      estimatedVolume: totalVolume,
      liquidationCount: clusterLiqs.length,
      side,
      timestamp: now,
      triggerPrice,
      affectedLevels,
    });
  }

  return cascades.sort((a, b) => {
    const riskScore = { high: 3, medium: 2, low: 1 };
    return riskScore[b.risk] - riskScore[a.risk];
  });
}

/**
 * Cluster liquidations by price proximity
 */
function clusterLiquidationsByPrice(
  liquidations: ClassifiedLiquidation[],
  rangePercent: number
): Array<{ price: number; liquidations: ClassifiedLiquidation[] }> {
  const clusters: Map<number, ClassifiedLiquidation[]> = new Map();

  for (const liq of liquidations) {
    let foundCluster = false;

    // Try to add to existing cluster
    for (const [clusterPrice, clusterLiqs] of clusters.entries()) {
      const range = clusterPrice * rangePercent;
      if (Math.abs(liq.price - clusterPrice) <= range) {
        clusterLiqs.push(liq);
        foundCluster = true;
        break;
      }
    }

    // Create new cluster
    if (!foundCluster) {
      clusters.set(liq.price, [liq]);
    }
  }

  return Array.from(clusters.entries()).map(([price, liquidations]) => ({
    price,
    liquidations,
  }));
}

/**
 * Assess risk level for a cascade
 */
function assessCascadeRiskLevel(
  liquidationCount: number,
  totalVolume: number,
  config: CascadeCalculatorConfig,
  liquidations: ClassifiedLiquidation[]
): 'high' | 'medium' | 'low' {
  // Check for whale liquidations
  const whaleLiqs = liquidations.filter(
    l => l.classification.level === 'whale'
  );

  // High risk: many liquidations or whale involvement or very high volume
  if (
    whaleLiqs.length >= 2 ||
    liquidationCount >= config.minLiquidations * 3 ||
    totalVolume >= config.minVolume * 5
  ) {
    return 'high';
  }

  // Medium risk: moderate liquidations or high volume
  if (
    liquidationCount >= config.minLiquidations * 2 ||
    totalVolume >= config.minVolume * 2.5
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Find price levels that could be affected by cascade
 */
function findAffectedLevels(
  cascadePrice: number,
  side: 'long' | 'short',
  currentPrice: number,
  depth: number
): number[] {
  const levels: number[] = [];
  const step = cascadePrice * 0.01; // 1% steps

  for (let i = 1; i <= depth; i++) {
    const level = side === 'long' 
      ? cascadePrice - (step * i)  // Levels below for long cascades
      : cascadePrice + (step * i); // Levels above for short cascades
    
    levels.push(level);
  }

  return levels;
}

/**
 * Monitor cascade progression
 */
export function monitorCascadeProgression(
  cascade: LiquidationCascade,
  currentPrice: number,
  newLiquidations: ClassifiedLiquidation[]
): {
  isTriggered: boolean;
  isActive: boolean;
  affectedLevelsHit: number[];
} {
  const triggered = cascade.triggerPrice
    ? (cascade.side === 'long' 
        ? currentPrice <= cascade.triggerPrice
        : currentPrice >= cascade.triggerPrice)
    : false;

  // Check which affected levels have been hit
  const affectedLevelsHit = cascade.affectedLevels.filter(level =>
    cascade.side === 'long'
      ? currentPrice <= level
      : currentPrice >= level
  );

  // Check if cascade is still active (recent liquidations in affected levels)
  const recentWindow = Date.now() - 60000; // last minute
  const activeLiquidations = newLiquidations.filter(l => {
    if (l.timestamp < recentWindow) return false;
    return cascade.affectedLevels.some(
      level => Math.abs(l.price - level) <= level * 0.005
    );
  });

  return {
    isTriggered: triggered,
    isActive: activeLiquidations.length > 0,
    affectedLevelsHit,
  };
}

/**
 * Estimate potential cascade impact
 */
export function estimateCascadeImpact(
  cascade: LiquidationCascade,
  volumeAtLevels: Map<number, number>
): {
  totalPotentialVolume: number;
  priceImpact: number;
  affectedLevelsCount: number;
} {
  let totalPotentialVolume = cascade.estimatedVolume;
  
  // Add volume at affected levels
  cascade.affectedLevels.forEach(level => {
    const volume = volumeAtLevels.get(level) || 0;
    totalPotentialVolume += volume;
  });

  // Estimate price impact (rough approximation)
  const priceImpactPercent = cascade.side === 'long'
    ? -(cascade.affectedLevels.length * 0.5) // Downward impact
    : (cascade.affectedLevels.length * 0.5);  // Upward impact

  return {
    totalPotentialVolume,
    priceImpact: priceImpactPercent,
    affectedLevelsCount: cascade.affectedLevels.length,
  };
}
