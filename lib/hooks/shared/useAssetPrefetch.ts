'use client';

import { useEffect, useCallback } from 'react';
import { useAssetStore, type Asset } from '@/lib/stores/assetStore';
import { useMarketDataStore } from '@/lib/stores/marketDataStore';
import { logger } from '@/lib/monitoring/logger';

const ASSETS_TO_PREFETCH: Asset[] = ['BTC', 'ETH', 'HYPE'];
const PREFETCH_INTERVAL = 30000; // Refresh every 30 seconds
const BACKGROUND_REFRESH_INTERVAL = 60000; // Background refresh every 60 seconds

/**
 * Hook to prefetch market data for all assets in parallel
 */
export function useAssetPrefetch() {
  const { markAsPrefetched, isPrefetched, currentAsset } = useAssetStore();
  const { setMarketData } = useMarketDataStore();

  const fetchAssetData = useCallback(async (asset: Asset) => {
    try {
      // This would normally fetch from API
      // For now, we'll simulate the data structure
      const data = {
        coin: asset,
        price: 0,
        volume24h: 0,
        change24h: 0,
        high24h: 0,
        low24h: 0,
        timestamp: Date.now(),
      };

      setMarketData(asset, data);
      markAsPrefetched(asset);
      
      logger.debug(`Prefetched data for ${asset}`);
    } catch (error) {
      logger.error(`Failed to prefetch ${asset}`, error as Error);
    }
  }, [setMarketData, markAsPrefetched]);

  const prefetchAllAssets = useCallback(async () => {
    logger.debug('Starting parallel prefetch for all assets');
    
    const startTime = Date.now();
    
    // Fetch all assets in parallel
    await Promise.all(
      ASSETS_TO_PREFETCH.map(asset => fetchAssetData(asset))
    );
    
    const duration = Date.now() - startTime;
    logger.debug('Completed prefetch', { durationMs: duration });
  }, [fetchAssetData]);

  const refreshInactiveAssets = useCallback(async () => {
    const inactiveAssets = ASSETS_TO_PREFETCH.filter(asset => asset !== currentAsset);
    
    if (inactiveAssets.length === 0) return;
    
    logger.debug('Refreshing inactive assets', { assets: inactiveAssets });
    
    await Promise.all(
      inactiveAssets.map(asset => fetchAssetData(asset))
    );
  }, [currentAsset, fetchAssetData]);

  // Initial prefetch on mount
  useEffect(() => {
    prefetchAllAssets();
  }, [prefetchAllAssets]);

  // Periodic refresh of all assets
  useEffect(() => {
    const interval = setInterval(() => {
      prefetchAllAssets();
    }, PREFETCH_INTERVAL);

    return () => clearInterval(interval);
  }, [prefetchAllAssets]);

  // Background refresh of inactive assets
  useEffect(() => {
    const interval = setInterval(() => {
      refreshInactiveAssets();
    }, BACKGROUND_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshInactiveAssets]);

  return {
    isPrefetched,
    prefetch: fetchAssetData,
    prefetchAll: prefetchAllAssets,
  };
}

/**
 * Hook to ensure an asset is prefetched before switching
 */
export function useEnsurePrefetched(asset: Asset) {
  const { isPrefetched } = useAssetStore();
  const { prefetch } = useAssetPrefetch();

  useEffect(() => {
    if (!isPrefetched(asset)) {
      prefetch(asset);
    }
  }, [asset, isPrefetched, prefetch]);

  return isPrefetched(asset);
}
