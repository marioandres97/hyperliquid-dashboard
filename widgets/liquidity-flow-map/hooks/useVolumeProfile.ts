'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getVolumeProfileService, type VolumeProfileConfig } from '../services/volumeProfileService';
import type {
  Coin,
  ClassifiedTrade,
  LiquidityNode,
  VolumeProfile,
  VolumeProfileMarkers,
} from '../types';

export interface UseVolumeProfileOptions {
  coin: Coin;
  trades?: ClassifiedTrade[];
  nodes?: Map<number, LiquidityNode>;
  currentPrice?: number;
  config?: Partial<VolumeProfileConfig>;
  updateInterval?: number; // ms
}

export interface UseVolumeProfileResult {
  volumeProfile: VolumeProfileMarkers | null;
  profiles: VolumeProfile[];
  distribution: {
    abovePOC: number;
    belowPOC: number;
    atPOC: number;
  };
  highVolumeNodes: VolumeProfile[];
  lowVolumeNodes: VolumeProfile[];
  imbalances: VolumeProfile[];
  isInValueArea: boolean;
  isCalculating: boolean;
}

export function useVolumeProfile(options: UseVolumeProfileOptions): UseVolumeProfileResult {
  const { coin, trades = [], nodes, currentPrice, config, updateInterval = 1000 } = options;
  
  const service = useRef(getVolumeProfileService());
  const [volumeProfile, setVolumeProfile] = useState<VolumeProfileMarkers | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Update service configuration
  useEffect(() => {
    if (config) {
      service.current.updateConfig(config);
    }
  }, [config]);

  // Calculate volume profile
  useEffect(() => {
    if (trades.length === 0 && !nodes) {
      setVolumeProfile(null);
      return;
    }

    const timer = setInterval(() => {
      setIsCalculating(true);

      try {
        let profile: VolumeProfileMarkers | null = null;

        if (nodes) {
          profile = service.current.getVolumeProfileFromNodes(coin, nodes);
        } else if (trades.length > 0) {
          profile = service.current.getVolumeProfile(coin, trades);
        }

        setVolumeProfile(profile);
      } catch (error) {
        console.error('Error calculating volume profile:', error);
      } finally {
        setIsCalculating(false);
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [coin, trades, nodes, updateInterval]);

  // Calculate profiles array
  const profiles = useMemo(() => {
    return volumeProfile?.profiles || [];
  }, [volumeProfile]);

  // Calculate distribution
  const distribution = useMemo(() => {
    if (profiles.length === 0) {
      return { abovePOC: 0, belowPOC: 0, atPOC: 0 };
    }
    return service.current.getDistribution(profiles);
  }, [profiles]);

  // Get high volume nodes
  const highVolumeNodes = useMemo(() => {
    return service.current.getHighVolumeNodes(profiles, 0.8);
  }, [profiles]);

  // Get low volume nodes
  const lowVolumeNodes = useMemo(() => {
    return service.current.getLowVolumeNodes(profiles, 0.2);
  }, [profiles]);

  // Detect imbalances
  const imbalances = useMemo(() => {
    return service.current.detectImbalances(profiles, 0.7);
  }, [profiles]);

  // Check if current price is in value area
  const isInValueArea = useMemo(() => {
    if (!volumeProfile || !currentPrice) return false;
    return service.current.isInValueArea(currentPrice, volumeProfile);
  }, [volumeProfile, currentPrice]);

  return {
    volumeProfile,
    profiles,
    distribution,
    highVolumeNodes,
    lowVolumeNodes,
    imbalances,
    isInValueArea,
    isCalculating,
  };
}
