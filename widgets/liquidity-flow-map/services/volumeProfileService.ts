/**
 * Volume Profile Service
 * Calculates volume distribution across price levels with POC, VAH, VAL markers
 */

import type {
  Coin,
  ClassifiedTrade,
  LiquidityNode,
  VolumeProfile,
  VolumeProfileMarkers,
} from '../types';

export interface VolumeProfileConfig {
  priceGrouping: number; // Price level grouping
  valueAreaPercentage: number; // Default 70% for value area
  minVolume: number; // Minimum volume to include
}

const DEFAULT_CONFIG: VolumeProfileConfig = {
  priceGrouping: 10,
  valueAreaPercentage: 0.7,
  minVolume: 1000,
};

export class VolumeProfileService {
  private config: VolumeProfileConfig;

  constructor(config: Partial<VolumeProfileConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate volume profile from trades
   */
  calculateFromTrades(
    coin: Coin,
    trades: ClassifiedTrade[]
  ): VolumeProfile[] {
    const profileMap = new Map<number, VolumeProfile>();

    for (const trade of trades) {
      // Group by price level
      const priceLevel = this.groupPrice(trade.price);

      if (!profileMap.has(priceLevel)) {
        profileMap.set(priceLevel, {
          coin,
          timestamp: trade.timestamp,
          priceLevel,
          volume: 0,
          buyVolume: 0,
          sellVolume: 0,
          trades: 0,
          deltaVolume: 0,
        });
      }

      const profile = profileMap.get(priceLevel)!;
      profile.volume += trade.size;
      profile.trades += 1;
      profile.timestamp = Math.max(profile.timestamp, trade.timestamp);

      if (trade.side === 'buy') {
        profile.buyVolume += trade.size;
      } else {
        profile.sellVolume += trade.size;
      }

      profile.deltaVolume = profile.buyVolume - profile.sellVolume;
    }

    // Filter by minimum volume and convert to array
    return Array.from(profileMap.values())
      .filter(p => p.volume >= this.config.minVolume)
      .sort((a, b) => b.volume - a.volume);
  }

  /**
   * Calculate volume profile from liquidity nodes
   */
  calculateFromNodes(
    coin: Coin,
    nodes: Map<number, LiquidityNode>
  ): VolumeProfile[] {
    const profiles: VolumeProfile[] = [];

    nodes.forEach((node, price) => {
      const priceLevel = this.groupPrice(price);
      
      const profile: VolumeProfile = {
        coin,
        timestamp: node.timestamp,
        priceLevel,
        volume: node.buyVolume + node.sellVolume,
        buyVolume: node.buyVolume,
        sellVolume: node.sellVolume,
        trades: node.buyCount + node.sellCount,
        deltaVolume: node.netFlow,
      };

      if (profile.volume >= this.config.minVolume) {
        profiles.push(profile);
      }
    });

    return profiles.sort((a, b) => b.volume - a.volume);
  }

  /**
   * Calculate POC, VAH, VAL markers
   */
  calculateMarkers(profiles: VolumeProfile[]): VolumeProfileMarkers | null {
    if (profiles.length === 0) {
      return null;
    }

    // Calculate total volume
    const totalVolume = profiles.reduce((sum, p) => sum + p.volume, 0);

    // POC: Point of Control - price level with highest volume
    const poc = profiles[0].priceLevel;

    // Calculate value area (70% of volume around POC)
    const valueAreaVolume = totalVolume * this.config.valueAreaPercentage;
    const valueArea = this.calculateValueArea(profiles, poc, valueAreaVolume);

    return {
      poc,
      vah: valueArea.high,
      val: valueArea.low,
      totalVolume,
      valueAreaVolume,
      profiles,
    };
  }

  /**
   * Get comprehensive volume profile with markers
   */
  getVolumeProfile(
    coin: Coin,
    trades: ClassifiedTrade[]
  ): VolumeProfileMarkers | null {
    const profiles = this.calculateFromTrades(coin, trades);
    return this.calculateMarkers(profiles);
  }

  /**
   * Get volume profile from nodes
   */
  getVolumeProfileFromNodes(
    coin: Coin,
    nodes: Map<number, LiquidityNode>
  ): VolumeProfileMarkers | null {
    const profiles = this.calculateFromNodes(coin, nodes);
    return this.calculateMarkers(profiles);
  }

  /**
   * Get volume at specific price level
   */
  getVolumeAtPrice(
    profiles: VolumeProfile[],
    price: number
  ): VolumeProfile | null {
    const priceLevel = this.groupPrice(price);
    return profiles.find(p => p.priceLevel === priceLevel) || null;
  }

  /**
   * Check if price is in value area
   */
  isInValueArea(
    price: number,
    markers: VolumeProfileMarkers
  ): boolean {
    return price >= markers.val && price <= markers.vah;
  }

  /**
   * Get volume distribution percentages
   */
  getDistribution(profiles: VolumeProfile[]): {
    abovePOC: number;
    belowPOC: number;
    atPOC: number;
  } {
    if (profiles.length === 0) {
      return { abovePOC: 0, belowPOC: 0, atPOC: 0 };
    }

    const poc = profiles[0].priceLevel;
    const totalVolume = profiles.reduce((sum, p) => sum + p.volume, 0);

    let abovePOC = 0;
    let belowPOC = 0;
    let atPOC = 0;

    for (const profile of profiles) {
      if (profile.priceLevel > poc) {
        abovePOC += profile.volume;
      } else if (profile.priceLevel < poc) {
        belowPOC += profile.volume;
      } else {
        atPOC += profile.volume;
      }
    }

    return {
      abovePOC: abovePOC / totalVolume,
      belowPOC: belowPOC / totalVolume,
      atPOC: atPOC / totalVolume,
    };
  }

  /**
   * Detect volume imbalances
   */
  detectImbalances(
    profiles: VolumeProfile[],
    threshold: number = 0.7
  ): VolumeProfile[] {
    return profiles.filter(profile => {
      if (profile.volume === 0) return false;
      
      const buyRatio = profile.buyVolume / profile.volume;
      const sellRatio = profile.sellVolume / profile.volume;
      
      return buyRatio >= threshold || sellRatio >= threshold;
    });
  }

  /**
   * Get high volume nodes (HVN) - areas of high acceptance
   */
  getHighVolumeNodes(
    profiles: VolumeProfile[],
    percentile: number = 0.8
  ): VolumeProfile[] {
    if (profiles.length === 0) return [];

    const sorted = [...profiles].sort((a, b) => b.volume - a.volume);
    const cutoffIndex = Math.floor(sorted.length * (1 - percentile));
    
    return sorted.slice(0, cutoffIndex);
  }

  /**
   * Get low volume nodes (LVN) - areas of low acceptance/rejection
   */
  getLowVolumeNodes(
    profiles: VolumeProfile[],
    percentile: number = 0.2
  ): VolumeProfile[] {
    if (profiles.length === 0) return [];

    const sorted = [...profiles].sort((a, b) => a.volume - b.volume);
    const cutoffIndex = Math.floor(sorted.length * percentile);
    
    return sorted.slice(0, cutoffIndex);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VolumeProfileConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Group price by configured grouping
   */
  private groupPrice(price: number): number {
    return Math.round(price / this.config.priceGrouping) * this.config.priceGrouping;
  }

  /**
   * Calculate value area (70% volume around POC)
   */
  private calculateValueArea(
    profiles: VolumeProfile[],
    poc: number,
    targetVolume: number
  ): { high: number; low: number } {
    // Sort profiles by price
    const sorted = [...profiles].sort((a, b) => a.priceLevel - b.priceLevel);
    
    // Find POC index
    const pocIndex = sorted.findIndex(p => p.priceLevel === poc);
    if (pocIndex === -1) {
      return { high: poc, low: poc };
    }

    let accumulatedVolume = sorted[pocIndex].volume;
    let lowIndex = pocIndex;
    let highIndex = pocIndex;

    // Expand outward from POC until we reach target volume
    while (accumulatedVolume < targetVolume && (lowIndex > 0 || highIndex < sorted.length - 1)) {
      const canGoLower = lowIndex > 0;
      const canGoHigher = highIndex < sorted.length - 1;

      const lowerVolume = canGoLower ? sorted[lowIndex - 1].volume : 0;
      const higherVolume = canGoHigher ? sorted[highIndex + 1].volume : 0;

      // Expand to the side with more volume
      if (!canGoLower || (canGoHigher && higherVolume > lowerVolume)) {
        highIndex++;
        accumulatedVolume += sorted[highIndex].volume;
      } else {
        lowIndex--;
        accumulatedVolume += sorted[lowIndex].volume;
      }
    }

    return {
      high: sorted[highIndex].priceLevel,
      low: sorted[lowIndex].priceLevel,
    };
  }
}

// Factory function
export function createVolumeProfileService(
  config?: Partial<VolumeProfileConfig>
): VolumeProfileService {
  return new VolumeProfileService(config);
}

// Singleton instance
let instance: VolumeProfileService | null = null;

export function getVolumeProfileService(): VolumeProfileService {
  if (!instance) {
    instance = new VolumeProfileService();
  }
  return instance;
}
