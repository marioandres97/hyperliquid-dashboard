'use client';

// Hook for comprehensive pattern detection

import { useState, useEffect } from 'react';
import {
  DetectedPattern,
  PatternType,
  AbsorptionZone,
  LiquidationCascade,
  SupportResistanceLevel,
  FlowMetrics,
  Coin,
} from '../types';

export interface UsePatternDetectionOptions {
  coin: Coin;
  absorptionZones?: AbsorptionZone[];
  cascades?: LiquidationCascade[];
  srLevels?: SupportResistanceLevel[];
  metrics?: FlowMetrics | null;
  currentPrice: number;
  enabled?: boolean;
}

export interface UsePatternDetectionReturn {
  patterns: DetectedPattern[];
  patternsByType: Map<PatternType, DetectedPattern[]>;
  highConfidencePatterns: DetectedPattern[];
  isAnalyzing: boolean;
  lastUpdate: Date | null;
}

/**
 * Hook for detecting market patterns
 */
export function usePatternDetection({
  coin,
  absorptionZones = [],
  cascades = [],
  srLevels = [],
  metrics,
  currentPrice,
  enabled = true,
}: UsePatternDetectionOptions): UsePatternDetectionReturn {
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const detectPatterns = () => {
    if (!enabled) {
      setPatterns([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      const detectedPatterns: DetectedPattern[] = [];

      // Convert absorption zones to patterns
      absorptionZones.forEach(zone => {
        if (zone.status === 'active') {
          detectedPatterns.push({
            id: `pattern-${zone.id}`,
            type: 'absorption_zone',
            timestamp: zone.timestamp,
            price: zone.price,
            strength: zone.strength,
            confidence: zone.whaleActivity ? 0.9 : 0.7,
            description: `${zone.side === 'buy' ? 'Buy' : 'Sell'} absorption at $${zone.price.toFixed(2)}`,
            metadata: {
              volume: zone.volume,
              tradeCount: zone.tradeCount,
              whaleActivity: zone.whaleActivity,
              side: zone.side,
            },
          });
        }
      });

      // Convert cascades to patterns
      cascades.forEach(cascade => {
        detectedPatterns.push({
          id: `pattern-${cascade.id}`,
          type: 'liquidation_cascade',
          timestamp: cascade.timestamp,
          price: cascade.priceLevel,
          strength: cascade.risk === 'high' ? 90 : cascade.risk === 'medium' ? 60 : 30,
          confidence: Math.min(1, cascade.liquidationCount / 10),
          description: `${cascade.risk} risk ${cascade.side} cascade at $${cascade.priceLevel.toFixed(2)}`,
          metadata: {
            risk: cascade.risk,
            liquidationCount: cascade.liquidationCount,
            estimatedVolume: cascade.estimatedVolume,
            side: cascade.side,
          },
        });
      });

      // Convert S/R levels to patterns
      srLevels.forEach(level => {
        if (!level.isBreached) {
          const type: PatternType = level.type === 'support' ? 'support_level' : 'resistance_level';
          detectedPatterns.push({
            id: `pattern-${level.id}`,
            type,
            timestamp: level.lastTouch,
            price: level.price,
            strength: level.strength,
            confidence: Math.min(1, level.touchCount / 5),
            description: `${level.type} at $${level.price.toFixed(2)} (${level.touchCount} touches)`,
            metadata: {
              touchCount: level.touchCount,
              volume: level.volume,
              levelType: level.type,
            },
          });
        }

        // Breached levels become breakout/breakdown patterns
        if (level.isBreached && level.breachTimestamp) {
          const type: PatternType = level.type === 'support' ? 'breakdown' : 'breakout';
          detectedPatterns.push({
            id: `pattern-breach-${level.id}`,
            type,
            timestamp: level.breachTimestamp,
            price: level.price,
            strength: level.strength,
            confidence: 0.8,
            description: `${type} through $${level.price.toFixed(2)} level`,
            metadata: {
              originalLevel: level.type,
              touchCount: level.touchCount,
            },
          });
        }
      });

      // Detect whale accumulation/distribution from metrics
      if (metrics) {
        if (metrics.whaleNetFlow > 0 && metrics.whaleTradeCount >= 3) {
          detectedPatterns.push({
            id: `pattern-whale-acc-${Date.now()}`,
            type: 'whale_accumulation',
            timestamp: Date.now(),
            price: currentPrice,
            strength: Math.min(100, Math.abs(metrics.whaleImbalance) * 100),
            confidence: Math.min(1, metrics.whaleTradeCount / 5),
            description: `Whale accumulation detected (${metrics.whaleTradeCount} trades)`,
            metadata: {
              whaleNetFlow: metrics.whaleNetFlow,
              whaleTradeCount: metrics.whaleTradeCount,
              whaleImbalance: metrics.whaleImbalance,
            },
          });
        } else if (metrics.whaleNetFlow < 0 && metrics.whaleTradeCount >= 3) {
          detectedPatterns.push({
            id: `pattern-whale-dist-${Date.now()}`,
            type: 'whale_distribution',
            timestamp: Date.now(),
            price: currentPrice,
            strength: Math.min(100, Math.abs(metrics.whaleImbalance) * 100),
            confidence: Math.min(1, metrics.whaleTradeCount / 5),
            description: `Whale distribution detected (${metrics.whaleTradeCount} trades)`,
            metadata: {
              whaleNetFlow: metrics.whaleNetFlow,
              whaleTradeCount: metrics.whaleTradeCount,
              whaleImbalance: metrics.whaleImbalance,
            },
          });
        }
      }

      setPatterns(detectedPatterns);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[usePatternDetection] Error detecting patterns:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-detect patterns when inputs change
  useEffect(() => {
    detectPatterns();
  }, [absorptionZones, cascades, srLevels, metrics, enabled]);

  // Group patterns by type
  const patternsByType = new Map<PatternType, DetectedPattern[]>();
  patterns.forEach(pattern => {
    const existing = patternsByType.get(pattern.type) || [];
    existing.push(pattern);
    patternsByType.set(pattern.type, existing);
  });

  // Filter high confidence patterns
  const highConfidencePatterns = patterns.filter(p => p.confidence >= 0.7);

  return {
    patterns,
    patternsByType,
    highConfidencePatterns,
    isAnalyzing,
    lastUpdate,
  };
}
