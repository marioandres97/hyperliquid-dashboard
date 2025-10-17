'use client';

// Hook for detecting and monitoring absorption zones

import { useState, useEffect } from 'react';
import {
  AbsorptionZone,
  ClassifiedTrade,
  LiquidityNode,
  Coin,
} from '../types';
import {
  detectAbsorptionZones,
  updateAbsorptionZoneStatus,
  getActiveAbsorptionZones,
  AbsorptionDetectorConfig,
} from '../services/absorptionDetector';

export interface UseAbsorptionZonesOptions {
  coin: Coin;
  nodes: Map<number, LiquidityNode> | null;
  trades: ClassifiedTrade[];
  currentPrice: number;
  config?: Partial<AbsorptionDetectorConfig>;
  updateInterval?: number;
  enabled?: boolean;
}

export interface UseAbsorptionZonesReturn {
  zones: AbsorptionZone[];
  activeZones: AbsorptionZone[];
  isAnalyzing: boolean;
  lastUpdate: Date | null;
  refresh: () => void;
}

/**
 * Hook for detecting absorption zones
 */
export function useAbsorptionZones({
  coin,
  nodes,
  trades,
  currentPrice,
  config,
  updateInterval = 5000,
  enabled = true,
}: UseAbsorptionZonesOptions): UseAbsorptionZonesReturn {
  const [zones, setZones] = useState<AbsorptionZone[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const detectZones = () => {
    if (!enabled || !nodes || trades.length === 0) {
      setZones([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Detect new zones
      const detectedZones = detectAbsorptionZones(nodes, trades, coin, config);

      // Update existing zones
      const recentTrades = trades.slice(-100); // Last 100 trades
      const updatedZones = detectedZones.map(zone =>
        updateAbsorptionZoneStatus(zone, currentPrice, recentTrades)
      );

      setZones(updatedZones);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('[useAbsorptionZones] Error detecting zones:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-update zones
  useEffect(() => {
    if (!enabled) return;

    detectZones();

    const interval = setInterval(detectZones, updateInterval);
    return () => clearInterval(interval);
  }, [coin, nodes, trades, currentPrice, enabled, updateInterval]);

  // Get active zones
  const activeZones = getActiveAbsorptionZones(zones);

  return {
    zones,
    activeZones,
    isAnalyzing,
    lastUpdate,
    refresh: detectZones,
  };
}
