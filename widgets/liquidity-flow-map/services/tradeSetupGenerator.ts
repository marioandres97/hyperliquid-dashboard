/**
 * Trade Setup Generator
 * Combines all analytics to generate actionable trade setups
 */

import type {
  Coin,
  TradeSetup,
  DetectedPattern,
  VolumeProfileMarkers,
  MeanReversionSetup,
  AbsorptionZone,
  SupportResistanceLevel,
  TimeWindow,
  SetupPerformance,
} from '../types';

export interface TradeSetupConfig {
  minQuality: number; // 0-100
  minConfidence: number; // 0-1
  riskRewardRatio: number; // Minimum R:R
  maxSetups: number; // Maximum concurrent setups
}

const DEFAULT_CONFIG: TradeSetupConfig = {
  minQuality: 60,
  minConfidence: 0.7,
  riskRewardRatio: 2.0,
  maxSetups: 5,
};

export class TradeSetupGenerator {
  private config: TradeSetupConfig;
  private activeSetups: Map<string, TradeSetup> = new Map();
  private setupPerformance: Map<string, SetupPerformance> = new Map();

  constructor(config: Partial<TradeSetupConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate trade setups from all available analytics
   */
  generateSetups(
    coin: Coin,
    currentPrice: number,
    patterns: DetectedPattern[],
    volumeProfile?: VolumeProfileMarkers,
    meanReversion?: MeanReversionSetup,
    absorptionZones?: AbsorptionZone[],
    supportResistance?: SupportResistanceLevel[],
    timeWindow: TimeWindow = '5m'
  ): TradeSetup[] {
    const setups: TradeSetup[] = [];

    // Generate setups from different strategies
    
    // 1. Pattern-based setups
    const patternSetups = this.generatePatternSetups(
      coin,
      currentPrice,
      patterns,
      supportResistance,
      volumeProfile,
      timeWindow
    );
    setups.push(...patternSetups);

    // 2. Mean reversion setups
    if (meanReversion) {
      const mrSetup = this.generateMeanReversionSetup(
        coin,
        currentPrice,
        meanReversion,
        patterns,
        supportResistance,
        timeWindow
      );
      if (mrSetup) setups.push(mrSetup);
    }

    // 3. Absorption zone setups
    if (absorptionZones && absorptionZones.length > 0) {
      const absorptionSetups = this.generateAbsorptionSetups(
        coin,
        currentPrice,
        absorptionZones,
        patterns,
        supportResistance,
        timeWindow
      );
      setups.push(...absorptionSetups);
    }

    // 4. Volume profile setups
    if (volumeProfile) {
      const vpSetup = this.generateVolumeProfileSetup(
        coin,
        currentPrice,
        volumeProfile,
        patterns,
        supportResistance,
        timeWindow
      );
      if (vpSetup) setups.push(vpSetup);
    }

    // Filter and rank setups
    const filteredSetups = setups
      .filter(s => s.quality >= this.config.minQuality)
      .filter(s => s.confidence >= this.config.minConfidence)
      .filter(s => s.riskRewardRatio >= this.config.riskRewardRatio)
      .sort((a, b) => b.quality - a.quality)
      .slice(0, this.config.maxSetups);

    // Store active setups
    filteredSetups.forEach(setup => {
      this.activeSetups.set(setup.id, setup);
      this.initializePerformance(setup);
    });

    return filteredSetups;
  }

  /**
   * Generate setups from detected patterns
   */
  private generatePatternSetups(
    coin: Coin,
    currentPrice: number,
    patterns: DetectedPattern[],
    supportResistance?: SupportResistanceLevel[],
    volumeProfile?: VolumeProfileMarkers,
    timeWindow: TimeWindow = '5m'
  ): TradeSetup[] {
    const setups: TradeSetup[] = [];

    // Filter for actionable patterns
    const actionablePatterns = patterns.filter(p =>
      ['breakout', 'breakdown', 'whale_accumulation', 'whale_distribution'].includes(p.type)
    );

    for (const pattern of actionablePatterns) {
      const isLong = ['breakout', 'whale_accumulation'].includes(pattern.type);
      
      // Find nearest S/R levels for entry/exit
      const { entry, target1, target2, stopLoss } = this.calculateLevels(
        currentPrice,
        pattern.price,
        isLong,
        supportResistance,
        volumeProfile
      );

      const riskRewardRatio = this.calculateRiskReward(entry, target1, stopLoss);

      if (riskRewardRatio >= this.config.riskRewardRatio) {
        const setup: TradeSetup = {
          id: `pattern_${pattern.id}`,
          coin,
          timestamp: Date.now(),
          type: isLong ? 'long' : 'short',
          quality: pattern.confidence * pattern.strength,
          confidence: pattern.confidence,
          entry,
          target1,
          target2,
          stopLoss,
          riskRewardRatio,
          patterns: [pattern],
          volumeProfile,
          supportResistance: supportResistance?.filter(sr => 
            Math.abs(sr.price - currentPrice) / currentPrice < 0.05
          ),
          description: `${pattern.type.replace('_', ' ').toUpperCase()} setup`,
          reasoning: [
            `${pattern.description}`,
            `Entry at ${entry.toFixed(2)}`,
            `Target 1: ${target1.toFixed(2)} (${((target1 - entry) / entry * 100).toFixed(2)}%)`,
            `Stop Loss: ${stopLoss.toFixed(2)} (${((stopLoss - entry) / entry * 100).toFixed(2)}%)`,
          ],
          risks: this.identifyRisks(pattern, supportResistance),
          timeframe: timeWindow,
          status: 'active',
        };

        setups.push(setup);
      }
    }

    return setups;
  }

  /**
   * Generate mean reversion setup
   */
  private generateMeanReversionSetup(
    coin: Coin,
    currentPrice: number,
    meanReversion: MeanReversionSetup,
    patterns: DetectedPattern[],
    supportResistance?: SupportResistanceLevel[],
    timeWindow: TimeWindow = '5m'
  ): TradeSetup | null {
    const isLong = meanReversion.type === 'oversold';
    
    const entry = currentPrice;
    const target1 = meanReversion.targetPrice;
    const spread = Math.abs(target1 - entry);
    const target2 = isLong ? target1 + spread * 0.5 : target1 - spread * 0.5;
    const stopLoss = isLong ? entry - spread * 0.5 : entry + spread * 0.5;

    const riskRewardRatio = this.calculateRiskReward(entry, target1, stopLoss);

    if (riskRewardRatio < this.config.riskRewardRatio) {
      return null;
    }

    return {
      id: `mr_${meanReversion.id}`,
      coin,
      timestamp: Date.now(),
      type: isLong ? 'long' : 'short',
      quality: meanReversion.strength,
      confidence: meanReversion.reversionProbability,
      entry,
      target1,
      target2,
      stopLoss,
      riskRewardRatio,
      patterns: patterns.filter(p => Math.abs(p.price - currentPrice) / currentPrice < 0.02),
      meanReversion,
      supportResistance: supportResistance?.filter(sr =>
        Math.abs(sr.price - meanReversion.meanPrice) / meanReversion.meanPrice < 0.01
      ),
      description: `Mean Reversion ${meanReversion.type.toUpperCase()}`,
      reasoning: [
        `Price is ${meanReversion.deviation.toFixed(2)} std devs ${meanReversion.type === 'overbought' ? 'above' : 'below'} mean`,
        `Reversion probability: ${(meanReversion.reversionProbability * 100).toFixed(1)}%`,
        `Target mean price: ${meanReversion.meanPrice.toFixed(2)}`,
        meanReversion.metadata.volumeConfirmation ? 'Volume confirms setup' : '',
        meanReversion.metadata.patternConfirmation ? 'Pattern confirms setup' : '',
      ].filter(Boolean),
      risks: [
        'Mean can shift during strong trends',
        'Requires strict stop loss management',
      ],
      timeframe: timeWindow,
      status: 'active',
    };
  }

  /**
   * Generate absorption zone setups
   */
  private generateAbsorptionSetups(
    coin: Coin,
    currentPrice: number,
    absorptionZones: AbsorptionZone[],
    patterns: DetectedPattern[],
    supportResistance?: SupportResistanceLevel[],
    timeWindow: TimeWindow = '5m'
  ): TradeSetup[] {
    const setups: TradeSetup[] = [];

    // Filter for active zones near current price
    const nearbyZones = absorptionZones.filter(zone =>
      zone.status === 'active' &&
      Math.abs(zone.price - currentPrice) / currentPrice < 0.05
    );

    for (const zone of nearbyZones) {
      const isLong = zone.side === 'buy'; // Buy absorption = support
      
      const entry = zone.price;
      const spread = Math.abs(currentPrice - entry);
      const target1 = isLong ? entry + spread * 2 : entry - spread * 2;
      const target2 = isLong ? entry + spread * 3 : entry - spread * 3;
      const stopLoss = isLong ? 
        zone.priceRange[0] - spread * 0.3 : 
        zone.priceRange[1] + spread * 0.3;

      const riskRewardRatio = this.calculateRiskReward(entry, target1, stopLoss);

      if (riskRewardRatio >= this.config.riskRewardRatio) {
        setups.push({
          id: `absorption_${zone.id}`,
          coin,
          timestamp: Date.now(),
          type: isLong ? 'long' : 'short',
          quality: zone.strength,
          confidence: zone.strength / 100,
          entry,
          target1,
          target2,
          stopLoss,
          riskRewardRatio,
          patterns: patterns.filter(p => p.type === 'absorption_zone'),
          absorptionZones: [zone],
          supportResistance,
          description: `Absorption Zone ${isLong ? 'SUPPORT' : 'RESISTANCE'}`,
          reasoning: [
            `${zone.side.toUpperCase()} absorption at ${zone.price.toFixed(2)}`,
            `Zone strength: ${zone.strength.toFixed(1)}/100`,
            zone.whaleActivity ? 'Whale activity detected' : '',
            `Volume: ${zone.volume.toFixed(0)}`,
          ].filter(Boolean),
          risks: [
            'Zone can be broken with strong momentum',
            'Requires confirmation before entry',
          ],
          timeframe: timeWindow,
          status: 'active',
        });
      }
    }

    return setups;
  }

  /**
   * Generate volume profile setup
   */
  private generateVolumeProfileSetup(
    coin: Coin,
    currentPrice: number,
    volumeProfile: VolumeProfileMarkers,
    patterns: DetectedPattern[],
    supportResistance?: SupportResistanceLevel[],
    timeWindow: TimeWindow = '5m'
  ): TradeSetup | null {
    // Check if price is outside value area
    const aboveValueArea = currentPrice > volumeProfile.vah;
    const belowValueArea = currentPrice < volumeProfile.val;

    if (!aboveValueArea && !belowValueArea) {
      return null; // Price in value area, no setup
    }

    const isLong = belowValueArea; // Below value area = potential long
    const entry = currentPrice;
    const target1 = volumeProfile.poc; // Target is POC
    const spread = Math.abs(target1 - entry);
    const target2 = isLong ? volumeProfile.vah : volumeProfile.val;
    const stopLoss = isLong ? 
      volumeProfile.val - spread * 0.3 : 
      volumeProfile.vah + spread * 0.3;

    const riskRewardRatio = this.calculateRiskReward(entry, target1, stopLoss);

    if (riskRewardRatio < this.config.riskRewardRatio) {
      return null;
    }

    const quality = Math.min(100, 70 + (Math.abs(currentPrice - target1) / target1) * 100);

    return {
      id: `vp_${coin}_${Date.now()}`,
      coin,
      timestamp: Date.now(),
      type: isLong ? 'long' : 'short',
      quality,
      confidence: 0.75,
      entry,
      target1,
      target2,
      stopLoss,
      riskRewardRatio,
      patterns,
      volumeProfile,
      supportResistance,
      description: `Volume Profile ${isLong ? 'LONG' : 'SHORT'} to POC`,
      reasoning: [
        `Price ${isLong ? 'below VAL' : 'above VAH'} - outside value area`,
        `POC at ${volumeProfile.poc.toFixed(2)} acts as magnet`,
        `Value area: ${volumeProfile.val.toFixed(2)} - ${volumeProfile.vah.toFixed(2)}`,
        `Total volume: ${volumeProfile.totalVolume.toFixed(0)}`,
      ],
      risks: [
        'Price can trend away from value area',
        'Requires volume confirmation',
      ],
      timeframe: timeWindow,
      status: 'active',
    };
  }

  /**
   * Calculate entry, targets, and stop loss levels
   */
  private calculateLevels(
    currentPrice: number,
    patternPrice: number,
    isLong: boolean,
    supportResistance?: SupportResistanceLevel[],
    volumeProfile?: VolumeProfileMarkers
  ): { entry: number; target1: number; target2: number; stopLoss: number } {
    const entry = currentPrice;
    
    // Find nearest S/R for targets and stops
    let target1 = patternPrice;
    let target2 = patternPrice;
    let stopLoss = currentPrice;

    if (supportResistance && supportResistance.length > 0) {
      const sorted = [...supportResistance].sort((a, b) => 
        Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice)
      );

      if (isLong) {
        // Find resistance levels above for targets
        const resistances = sorted.filter(sr => sr.type === 'resistance' && sr.price > currentPrice);
        if (resistances.length > 0) {
          target1 = resistances[0].price;
          target2 = resistances[1]?.price || target1 * 1.02;
        }

        // Find support below for stop
        const supports = sorted.filter(sr => sr.type === 'support' && sr.price < currentPrice);
        stopLoss = supports[0]?.price || currentPrice * 0.98;
      } else {
        // Find support levels below for targets
        const supports = sorted.filter(sr => sr.type === 'support' && sr.price < currentPrice);
        if (supports.length > 0) {
          target1 = supports[0].price;
          target2 = supports[1]?.price || target1 * 0.98;
        }

        // Find resistance above for stop
        const resistances = sorted.filter(sr => sr.type === 'resistance' && sr.price > currentPrice);
        stopLoss = resistances[0]?.price || currentPrice * 1.02;
      }
    } else {
      // Use percentage-based levels
      const spread = currentPrice * 0.02; // 2%
      if (isLong) {
        target1 = currentPrice + spread * 2;
        target2 = currentPrice + spread * 3;
        stopLoss = currentPrice - spread;
      } else {
        target1 = currentPrice - spread * 2;
        target2 = currentPrice - spread * 3;
        stopLoss = currentPrice + spread;
      }
    }

    return { entry, target1, target2, stopLoss };
  }

  /**
   * Calculate risk-reward ratio
   */
  private calculateRiskReward(entry: number, target: number, stopLoss: number): number {
    const reward = Math.abs(target - entry);
    const risk = Math.abs(entry - stopLoss);
    
    if (risk === 0) return 0;
    return reward / risk;
  }

  /**
   * Identify risks for a setup
   */
  private identifyRisks(
    pattern: DetectedPattern,
    supportResistance?: SupportResistanceLevel[]
  ): string[] {
    const risks: string[] = [];

    if (pattern.confidence < 0.8) {
      risks.push('Medium confidence - requires confirmation');
    }

    if (!supportResistance || supportResistance.length === 0) {
      risks.push('No clear S/R levels - wider stops recommended');
    }

    if (pattern.type === 'breakout' || pattern.type === 'breakdown') {
      risks.push('Breakout can be false - wait for retest');
    }

    return risks;
  }

  /**
   * Initialize performance tracking for a setup
   */
  private initializePerformance(setup: TradeSetup): void {
    this.setupPerformance.set(setup.id, {
      setupId: setup.id,
      highPrice: setup.entry,
      lowPrice: setup.entry,
      pnl: 0,
      status: 'open',
      maxDrawdown: 0,
      maxProfit: 0,
    });
  }

  /**
   * Update setup performance
   */
  updatePerformance(setupId: string, currentPrice: number): SetupPerformance | null {
    const setup = this.activeSetups.get(setupId);
    const performance = this.setupPerformance.get(setupId);
    
    if (!setup || !performance) return null;

    // Update high/low
    performance.highPrice = Math.max(performance.highPrice, currentPrice);
    performance.lowPrice = Math.min(performance.lowPrice, currentPrice);

    // Calculate PnL
    const isLong = setup.type === 'long';
    performance.pnl = isLong ?
      ((currentPrice - setup.entry) / setup.entry) * 100 :
      ((setup.entry - currentPrice) / setup.entry) * 100;

    // Update max drawdown and profit
    performance.maxProfit = Math.max(performance.maxProfit, performance.pnl);
    performance.maxDrawdown = Math.min(performance.maxDrawdown, performance.pnl);

    // Check if stopped out or target hit
    if (isLong) {
      if (currentPrice <= setup.stopLoss) {
        performance.status = 'loss';
        performance.exitPrice = currentPrice;
        performance.exitTime = Date.now();
        setup.status = 'stopped';
      } else if (currentPrice >= setup.target1) {
        performance.status = 'win';
        performance.exitPrice = currentPrice;
        performance.exitTime = Date.now();
        setup.status = 'completed';
      }
    } else {
      if (currentPrice >= setup.stopLoss) {
        performance.status = 'loss';
        performance.exitPrice = currentPrice;
        performance.exitTime = Date.now();
        setup.status = 'stopped';
      } else if (currentPrice <= setup.target1) {
        performance.status = 'win';
        performance.exitPrice = currentPrice;
        performance.exitTime = Date.now();
        setup.status = 'completed';
      }
    }

    return performance;
  }

  /**
   * Get active setups
   */
  getActiveSetups(): TradeSetup[] {
    return Array.from(this.activeSetups.values())
      .filter(s => s.status === 'active' || s.status === 'triggered');
  }

  /**
   * Get setup performance
   */
  getPerformance(setupId: string): SetupPerformance | null {
    return this.setupPerformance.get(setupId) || null;
  }

  /**
   * Get all performance records
   */
  getAllPerformance(): SetupPerformance[] {
    return Array.from(this.setupPerformance.values());
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TradeSetupConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear old setups
   */
  clearOldSetups(maxAge: number = 3600000): void {
    const now = Date.now();
    Array.from(this.activeSetups.entries()).forEach(([id, setup]) => {
      if (now - setup.timestamp > maxAge) {
        this.activeSetups.delete(id);
        this.setupPerformance.delete(id);
      }
    });
  }
}

// Singleton instance
let instance: TradeSetupGenerator | null = null;

export function getTradeSetupGenerator(): TradeSetupGenerator {
  if (!instance) {
    instance = new TradeSetupGenerator();
  }
  return instance;
}
