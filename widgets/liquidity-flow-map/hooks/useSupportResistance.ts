'use client';

// Hook for detecting and monitoring support/resistance levels

import { useState, useEffect } from 'react';
import {
  SupportResistanceLevel,
  ClassifiedTrade,
  LiquidityNode,
  Coin,
} from '../types';
import {
  detectSupportResistanceLevels,
  updateSRLevel,
  getNearestSupport,
  getNearestResistance,
  SRDetectorConfig,
} from '../services/supportResistanceDetector';

export interface UseSupportResistanceOptions {
  coin: Coin;
  trades: ClassifiedTrade[];
  nodes: Map<number, LiquidityNode> | null;
  currentPrice: number;
  config?: Partial<SRDetectorConfig>;
  updateInterval?: number;
  enabled?: boolean;
}

export interface UseSupportResistanceReturn {
  levels: SupportResistanceLevel[];
  supportLevels: SupportResistanceLevel[];
  resistanceLevels: SupportResistanceLevel[];
  nearestSupport: SupportResistanceLevel | null;
  nearestResistance: SupportResistanceLevel | null;
  breachedLevels: SupportResistanceLevel[];
  isAnalyzing: boolean;
  lastUpdate: Date | null;
  refresh: () => void;
}

/**
 * Hook for detecting support/resistance levels
 */
export function useSupportResistance({
  coin,
  trades,
  nodes,
  currentPrice,
  config,
  updateInterval = 10000,
  enabled = true,
}: UseSupportResistanceOptions): UseSupportResistanceReturn {
  const [levels, setLevels] = useState<SupportResistanceLevel[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const detectLevels = () => {
    if (!enabled || !nodes || trades.length === 0) {
      setLevels([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Detect S/R levels
      const detectedLevels = detectSupportResistanceLevels(
        trades,
        nodes,
        coin,
        currentPrice,
        config
      );

      // Update existing levels with new data
      const recentTrades = trades.slice(-100);
      const updatedLevels = detectedLevels.map(level =>
        updateSRLevel(level, recentTrades, currentPrice, config)
      );

      setLevels(updatedLevels);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[useSupportResistance] Error detecting levels:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-update levels
  useEffect(() => {
    if (!enabled) return;

    detectLevels();

    const interval = setInterval(detectLevels, updateInterval);
    return () => clearInterval(interval);
  }, [coin, trades, nodes, currentPrice, enabled, updateInterval]);

  // Filter levels by type
  const supportLevels = levels.filter(l => l.type === 'support' && !l.isBreached);
  const resistanceLevels = levels.filter(l => l.type === 'resistance' && !l.isBreached);
  const breachedLevels = levels.filter(l => l.isBreached);

  // Get nearest levels
  const nearestSupportLevel = getNearestSupport(levels, currentPrice);
  const nearestResistanceLevel = getNearestResistance(levels, currentPrice);

  return {
    levels,
    supportLevels,
    resistanceLevels,
    nearestSupport: nearestSupportLevel,
    nearestResistance: nearestResistanceLevel,
    breachedLevels,
    isAnalyzing,
    lastUpdate,
    refresh: detectLevels,
  };
}
