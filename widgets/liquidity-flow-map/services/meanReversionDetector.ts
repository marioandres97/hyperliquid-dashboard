/**
 * Mean Reversion Detector
 * Detects overbought/oversold conditions and mean reversion opportunities
 */

import type {
  Coin,
  ClassifiedTrade,
  LiquidityNode,
  FlowMetrics,
  MeanReversionSetup,
  TimeWindow,
} from '../types';

export interface MeanReversionConfig {
  lookbackPeriod: number; // Number of trades to consider
  deviationThreshold: number; // Standard deviations for signal
  volumeConfirmationThreshold: number; // Volume multiplier
  minConfidence: number; // Minimum confidence (0-1)
}

const DEFAULT_CONFIG: MeanReversionConfig = {
  lookbackPeriod: 100,
  deviationThreshold: 2.0,
  volumeConfirmationThreshold: 1.5,
  minConfidence: 0.6,
};

interface PriceStatistics {
  mean: number;
  stdDev: number;
  median: number;
  min: number;
  max: number;
}

export class MeanReversionDetector {
  private config: MeanReversionConfig;

  constructor(config: Partial<MeanReversionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect mean reversion setups
   */
  detectSetups(
    coin: Coin,
    trades: ClassifiedTrade[],
    currentPrice: number,
    metrics?: FlowMetrics,
    timeWindow: TimeWindow = '5m'
  ): MeanReversionSetup[] {
    if (trades.length < this.config.lookbackPeriod) {
      return [];
    }

    // Get recent trades
    const recentTrades = trades.slice(-this.config.lookbackPeriod);
    
    // Calculate price statistics
    const stats = this.calculateStatistics(recentTrades);
    
    // Calculate deviation from mean
    const deviation = (currentPrice - stats.mean) / stats.stdDev;
    
    // Detect setup type
    const setups: MeanReversionSetup[] = [];
    
    if (Math.abs(deviation) >= this.config.deviationThreshold) {
      const type = deviation > 0 ? 'overbought' : 'oversold';
      const targetPrice = stats.mean; // Target is the mean
      
      // Calculate reversion probability
      const probability = this.calculateReversionProbability(
        deviation,
        recentTrades,
        currentPrice,
        metrics
      );
      
      if (probability >= this.config.minConfidence) {
        // Check volume confirmation
        const volumeConfirmation = this.checkVolumeConfirmation(
          recentTrades,
          metrics
        );
        
        // Check pattern confirmation
        const patternConfirmation = this.checkPatternConfirmation(
          recentTrades,
          type
        );
        
        const setup: MeanReversionSetup = {
          id: `mr_${coin}_${Date.now()}`,
          coin,
          timestamp: Date.now(),
          type,
          currentPrice,
          meanPrice: stats.mean,
          deviation: Math.abs(deviation),
          reversionProbability: probability,
          targetPrice,
          strength: this.calculateStrength(deviation, probability, volumeConfirmation, patternConfirmation),
          metadata: {
            volumeConfirmation,
            patternConfirmation,
            timeframe: timeWindow,
          },
        };
        
        setups.push(setup);
      }
    }
    
    return setups;
  }

  /**
   * Detect from liquidity nodes
   */
  detectFromNodes(
    coin: Coin,
    nodes: Map<number, LiquidityNode>,
    currentPrice: number,
    timeWindow: TimeWindow = '5m'
  ): MeanReversionSetup[] {
    const prices: number[] = [];
    const volumes: number[] = [];

    nodes.forEach((node, price) => {
      prices.push(price);
      volumes.push(node.buyVolume + node.sellVolume);
    });

    if (prices.length < 10) {
      return [];
    }

    // Calculate volume-weighted mean
    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
    const weightedMean = prices.reduce((sum, price, i) => {
      return sum + (price * volumes[i] / totalVolume);
    }, 0);

    // Calculate standard deviation
    const variance = prices.reduce((sum, price, i) => {
      const weight = volumes[i] / totalVolume;
      return sum + weight * Math.pow(price - weightedMean, 2);
    }, 0);
    const stdDev = Math.sqrt(variance);

    // Calculate deviation
    const deviation = (currentPrice - weightedMean) / stdDev;

    if (Math.abs(deviation) >= this.config.deviationThreshold) {
      const type = deviation > 0 ? 'overbought' : 'oversold';
      const probability = this.calculateSimpleProbability(Math.abs(deviation));

      if (probability >= this.config.minConfidence) {
        return [{
          id: `mr_nodes_${coin}_${Date.now()}`,
          coin,
          timestamp: Date.now(),
          type,
          currentPrice,
          meanPrice: weightedMean,
          deviation: Math.abs(deviation),
          reversionProbability: probability,
          targetPrice: weightedMean,
          strength: probability * 100,
          metadata: {
            volumeConfirmation: true,
            patternConfirmation: false,
            timeframe: timeWindow,
          },
        }];
      }
    }

    return [];
  }

  /**
   * Calculate price statistics
   */
  private calculateStatistics(trades: ClassifiedTrade[]): PriceStatistics {
    const prices = trades.map(t => t.price);
    
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    const variance = prices.reduce((sum, p) => {
      return sum + Math.pow(p - mean, 2);
    }, 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    const sorted = [...prices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return {
      mean,
      stdDev,
      median,
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Calculate reversion probability
   */
  private calculateReversionProbability(
    deviation: number,
    trades: ClassifiedTrade[],
    currentPrice: number,
    metrics?: FlowMetrics
  ): number {
    // Base probability from deviation (higher deviation = higher probability)
    // Using inverse sigmoid function
    const baseProbability = 1 / (1 + Math.exp(-Math.abs(deviation) + 2));
    
    // Volume confirmation adjustment
    let volumeAdjustment = 0;
    if (metrics) {
      const avgVolume = (metrics.totalBuyVolume + metrics.totalSellVolume) / 2;
      const recentVolume = trades.slice(-10).reduce((sum, t) => sum + t.size, 0) / 10;
      
      if (recentVolume > avgVolume * this.config.volumeConfirmationThreshold) {
        volumeAdjustment = 0.1; // Boost probability
      }
    }
    
    // Price momentum adjustment (slowing down = higher reversion probability)
    const momentumAdjustment = this.calculateMomentumAdjustment(trades, currentPrice);
    
    const probability = Math.min(
      1,
      baseProbability + volumeAdjustment + momentumAdjustment
    );
    
    return probability;
  }

  /**
   * Calculate simple probability from deviation
   */
  private calculateSimpleProbability(deviation: number): number {
    // Sigmoid function centered at threshold
    return 1 / (1 + Math.exp(-(deviation - this.config.deviationThreshold)));
  }

  /**
   * Check volume confirmation
   */
  private checkVolumeConfirmation(
    trades: ClassifiedTrade[],
    metrics?: FlowMetrics
  ): boolean {
    if (!metrics) return false;

    const avgVolume = (metrics.totalBuyVolume + metrics.totalSellVolume) / trades.length;
    const recentVolume = trades.slice(-10).reduce((sum, t) => sum + t.size, 0) / 10;

    return recentVolume > avgVolume * this.config.volumeConfirmationThreshold;
  }

  /**
   * Check pattern confirmation
   */
  private checkPatternConfirmation(
    trades: ClassifiedTrade[],
    type: 'overbought' | 'oversold'
  ): boolean {
    if (trades.length < 20) return false;

    const recentTrades = trades.slice(-20);
    const buyCount = recentTrades.filter(t => t.side === 'buy').length;
    const sellCount = recentTrades.filter(t => t.side === 'sell').length;

    // For overbought, we expect selling pressure to increase
    if (type === 'overbought') {
      return sellCount > buyCount * 1.2;
    }
    
    // For oversold, we expect buying pressure to increase
    return buyCount > sellCount * 1.2;
  }

  /**
   * Calculate momentum adjustment
   */
  private calculateMomentumAdjustment(
    trades: ClassifiedTrade[],
    currentPrice: number
  ): number {
    if (trades.length < 20) return 0;

    const recentTrades = trades.slice(-20);
    const oldPrice = recentTrades[0].price;
    
    const priceChange = Math.abs((currentPrice - oldPrice) / oldPrice);
    
    // If price change is slowing down (< 1%), boost reversion probability
    if (priceChange < 0.01) {
      return 0.1;
    }
    
    // If price change is accelerating (> 5%), reduce reversion probability
    if (priceChange > 0.05) {
      return -0.1;
    }
    
    return 0;
  }

  /**
   * Calculate overall strength score
   */
  private calculateStrength(
    deviation: number,
    probability: number,
    volumeConfirmation: boolean,
    patternConfirmation: boolean
  ): number {
    let strength = probability * 50; // Base 50 points from probability
    
    strength += Math.min(deviation * 10, 25); // Up to 25 points from deviation
    
    if (volumeConfirmation) strength += 12.5;
    if (patternConfirmation) strength += 12.5;
    
    return Math.min(100, strength);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MeanReversionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): MeanReversionConfig {
    return { ...this.config };
  }
}

// Factory function
export function createMeanReversionDetector(
  config?: Partial<MeanReversionConfig>
): MeanReversionDetector {
  return new MeanReversionDetector(config);
}

// Singleton instance
let instance: MeanReversionDetector | null = null;

export function getMeanReversionDetector(): MeanReversionDetector {
  if (!instance) {
    instance = new MeanReversionDetector();
  }
  return instance;
}
