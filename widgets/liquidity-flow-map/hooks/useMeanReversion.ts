'use client';

import { useState, useEffect, useRef } from 'react';
import { getMeanReversionDetector, type MeanReversionConfig } from '../services/meanReversionDetector';
import type {
  Coin,
  ClassifiedTrade,
  LiquidityNode,
  FlowMetrics,
  MeanReversionSetup,
  TimeWindow,
} from '../types';

export interface UseMeanReversionOptions {
  coin: Coin;
  trades?: ClassifiedTrade[];
  nodes?: Map<number, LiquidityNode>;
  currentPrice: number;
  metrics?: FlowMetrics;
  timeWindow?: TimeWindow;
  config?: Partial<MeanReversionConfig>;
  updateInterval?: number; // ms
}

export interface UseMeanReversionResult {
  setups: MeanReversionSetup[];
  overboughtSetups: MeanReversionSetup[];
  oversoldSetups: MeanReversionSetup[];
  bestSetup: MeanReversionSetup | null;
  isAnalyzing: boolean;
}

export function useMeanReversion(options: UseMeanReversionOptions): UseMeanReversionResult {
  const {
    coin,
    trades = [],
    nodes,
    currentPrice,
    metrics,
    timeWindow = '5m',
    config,
    updateInterval = 2000,
  } = options;

  const detector = useRef(getMeanReversionDetector());
  const [setups, setSetups] = useState<MeanReversionSetup[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update detector configuration
  useEffect(() => {
    if (config) {
      detector.current.updateConfig(config);
    }
  }, [config]);

  // Detect mean reversion setups
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnalyzing(true);

      try {
        let detectedSetups: MeanReversionSetup[] = [];

        // Detect from trades if available
        if (trades.length > 0) {
          detectedSetups = detector.current.detectSetups(
            coin,
            trades,
            currentPrice,
            metrics,
            timeWindow
          );
        }
        // Detect from nodes if trades not available
        else if (nodes) {
          detectedSetups = detector.current.detectFromNodes(
            coin,
            nodes,
            currentPrice,
            timeWindow
          );
        }

        setSetups(detectedSetups);
      } catch (error) {
        console.error('Error detecting mean reversion setups:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [coin, trades, nodes, currentPrice, metrics, timeWindow, updateInterval]);

  // Filter overbought setups
  const overboughtSetups = setups.filter(s => s.type === 'overbought');

  // Filter oversold setups
  const oversoldSetups = setups.filter(s => s.type === 'oversold');

  // Get best setup (highest strength)
  const bestSetup = setups.length > 0
    ? setups.reduce((best, current) =>
        current.strength > best.strength ? current : best
      )
    : null;

  return {
    setups,
    overboughtSetups,
    oversoldSetups,
    bestSetup,
    isAnalyzing,
  };
}
