'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTradeSetupGenerator, type TradeSetupConfig } from '../services/tradeSetupGenerator';
import type {
  Coin,
  TradeSetup,
  SetupPerformance,
  DetectedPattern,
  VolumeProfileMarkers,
  MeanReversionSetup,
  AbsorptionZone,
  SupportResistanceLevel,
  TimeWindow,
} from '../types';

export interface UseTradeSetupsOptions {
  coin: Coin;
  currentPrice: number;
  patterns?: DetectedPattern[];
  volumeProfile?: VolumeProfileMarkers;
  meanReversion?: MeanReversionSetup;
  absorptionZones?: AbsorptionZone[];
  supportResistance?: SupportResistanceLevel[];
  timeWindow?: TimeWindow;
  config?: Partial<TradeSetupConfig>;
  updateInterval?: number; // ms
}

export interface UseTradeSetupsResult {
  setups: TradeSetup[];
  activeSetups: TradeSetup[];
  longSetups: TradeSetup[];
  shortSetups: TradeSetup[];
  bestSetup: TradeSetup | null;
  getPerformance: (setupId: string) => SetupPerformance | null;
  allPerformance: SetupPerformance[];
  updatePerformance: (setupId: string) => void;
  isGenerating: boolean;
}

export function useTradeSetups(options: UseTradeSetupsOptions): UseTradeSetupsResult {
  const {
    coin,
    currentPrice,
    patterns = [],
    volumeProfile,
    meanReversion,
    absorptionZones = [],
    supportResistance = [],
    timeWindow = '5m',
    config,
    updateInterval = 3000,
  } = options;

  const generator = useRef(getTradeSetupGenerator());
  const [setups, setSetups] = useState<TradeSetup[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update generator configuration
  useEffect(() => {
    if (config) {
      generator.current.updateConfig(config);
    }
  }, [config]);

  // Generate setups
  useEffect(() => {
    const timer = setInterval(() => {
      setIsGenerating(true);

      try {
        const generatedSetups = generator.current.generateSetups(
          coin,
          currentPrice,
          patterns,
          volumeProfile,
          meanReversion,
          absorptionZones,
          supportResistance,
          timeWindow
        );

        setSetups(generatedSetups);
      } catch (error) {
        console.error('Error generating trade setups:', error);
      } finally {
        setIsGenerating(false);
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [
    coin,
    currentPrice,
    patterns,
    volumeProfile,
    meanReversion,
    absorptionZones,
    supportResistance,
    timeWindow,
    updateInterval,
  ]);

  // Update performance for all active setups
  useEffect(() => {
    const timer = setInterval(() => {
      const activeSetups = generator.current.getActiveSetups();
      activeSetups.forEach(setup => {
        generator.current.updatePerformance(setup.id, currentPrice);
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [currentPrice]);

  // Clean up old setups periodically
  useEffect(() => {
    const timer = setInterval(() => {
      generator.current.clearOldSetups(3600000); // 1 hour
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  // Get active setups
  const activeSetups = setups.filter(s => s.status === 'active' || s.status === 'triggered');

  // Get long setups
  const longSetups = setups.filter(s => s.type === 'long');

  // Get short setups
  const shortSetups = setups.filter(s => s.type === 'short');

  // Get best setup (highest quality)
  const bestSetup = setups.length > 0
    ? setups.reduce((best, current) =>
        current.quality > best.quality ? current : best
      )
    : null;

  // Get performance for a setup
  const getPerformance = useCallback((setupId: string): SetupPerformance | null => {
    return generator.current.getPerformance(setupId);
  }, []);

  // Get all performance records
  const allPerformance = generator.current.getAllPerformance();

  // Manually update performance for a setup
  const updatePerformance = useCallback((setupId: string) => {
    generator.current.updatePerformance(setupId, currentPrice);
  }, [currentPrice]);

  return {
    setups,
    activeSetups,
    longSetups,
    shortSetups,
    bestSetup,
    getPerformance,
    allPerformance,
    updatePerformance,
    isGenerating,
  };
}
