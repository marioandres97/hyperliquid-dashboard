'use client';

// Hook for detecting and monitoring liquidation cascades

import { useState, useEffect } from 'react';
import {
  LiquidationCascade,
  ClassifiedLiquidation,
  Coin,
} from '../types';
import {
  calculateLiquidationCascades,
  monitorCascadeProgression,
  CascadeCalculatorConfig,
} from '../services/cascadeCalculator';

export interface UseLiquidationCascadesOptions {
  coin: Coin;
  liquidations: ClassifiedLiquidation[];
  currentPrice: number;
  config?: Partial<CascadeCalculatorConfig>;
  updateInterval?: number;
  enabled?: boolean;
}

export interface UseLiquidationCascadesReturn {
  cascades: LiquidationCascade[];
  highRiskCascades: LiquidationCascade[];
  triggeredCascades: LiquidationCascade[];
  isAnalyzing: boolean;
  lastUpdate: Date | null;
  refresh: () => void;
}

/**
 * Hook for detecting liquidation cascades
 */
export function useLiquidationCascades({
  coin,
  liquidations,
  currentPrice,
  config,
  updateInterval = 5000,
  enabled = true,
}: UseLiquidationCascadesOptions): UseLiquidationCascadesReturn {
  const [cascades, setCascades] = useState<LiquidationCascade[]>([]);
  const [triggeredCascades, setTriggeredCascades] = useState<LiquidationCascade[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const analyzeCascades = () => {
    if (!enabled || liquidations.length === 0) {
      setCascades([]);
      setTriggeredCascades([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Calculate cascade risks
      const detectedCascades = calculateLiquidationCascades(
        liquidations,
        coin,
        currentPrice,
        config
      );

      // Monitor cascade progression
      const triggered: LiquidationCascade[] = [];
      detectedCascades.forEach(cascade => {
        const progression = monitorCascadeProgression(
          cascade,
          currentPrice,
          liquidations.slice(-50) // Recent liquidations
        );

        if (progression.isTriggered) {
          triggered.push(cascade);
        }
      });

      setCascades(detectedCascades);
      setTriggeredCascades(triggered);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[useLiquidationCascades] Error analyzing cascades:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-update cascades
  useEffect(() => {
    if (!enabled) return;

    analyzeCascades();

    const interval = setInterval(analyzeCascades, updateInterval);
    return () => clearInterval(interval);
  }, [coin, liquidations, currentPrice, enabled, updateInterval]);

  // Get high-risk cascades
  const highRiskCascades = cascades.filter(c => c.risk === 'high');

  return {
    cascades,
    highRiskCascades,
    triggeredCascades,
    isAnalyzing,
    lastUpdate,
    refresh: analyzeCascades,
  };
}
