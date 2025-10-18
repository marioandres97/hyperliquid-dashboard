'use client';

import { useEffect, useState } from 'react';
import { getWSClient, AllMids } from '../websocket';
import { getAssetContext, getCurrentFundingRates } from '../client';
import { useAsset } from '@/lib/context/AssetContext';

export interface MarketData {
  coin: string;
  markPrice: number;
  midPrice: number;
  openInterest: number;
  fundingRate: number;
  volume24h: number;
  priceChange24h: number;
  lastUpdate: Date;
}

export function useMarketData() {
  const { currentAsset } = useAsset();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const wsClient = getWSClient();

    const initializeMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get initial data from REST API
        const assetCtx = await getAssetContext(currentAsset);
        
        if (mounted && assetCtx) {
          const data: MarketData = {
            coin: currentAsset,
            markPrice: parseFloat(assetCtx.markPx),
            midPrice: parseFloat(assetCtx.midPx || assetCtx.markPx),
            openInterest: parseFloat(assetCtx.openInterest),
            fundingRate: parseFloat(assetCtx.funding),
            volume24h: parseFloat(assetCtx.dayNtlVlm),
            priceChange24h: assetCtx.prevDayPx 
              ? ((parseFloat(assetCtx.markPx) - parseFloat(assetCtx.prevDayPx)) / parseFloat(assetCtx.prevDayPx)) * 100
              : 0,
            lastUpdate: new Date(),
          };
          setMarketData(data);
        }

        // Connect WebSocket if not already connected
        if (!wsClient.getConnectionStatus()) {
          await wsClient.connect();
        }

        // Subscribe to real-time price updates via AllMids
        wsClient.subscribeToAllMids((mids: AllMids) => {
          if (!mounted) return;
          
          const midPrice = mids[currentAsset];
          if (midPrice) {
            setMarketData(prev => prev ? {
              ...prev,
              midPrice: parseFloat(midPrice),
              lastUpdate: new Date(),
            } : null);
          }
        });

        // Periodically refresh full market data (every 30 seconds)
        const refreshInterval = setInterval(async () => {
          if (!mounted) return;
          
          try {
            const assetCtx = await getAssetContext(currentAsset);
            if (assetCtx && mounted) {
              const data: MarketData = {
                coin: currentAsset,
                markPrice: parseFloat(assetCtx.markPx),
                midPrice: parseFloat(assetCtx.midPx || assetCtx.markPx),
                openInterest: parseFloat(assetCtx.openInterest),
                fundingRate: parseFloat(assetCtx.funding),
                volume24h: parseFloat(assetCtx.dayNtlVlm),
                priceChange24h: assetCtx.prevDayPx 
                  ? ((parseFloat(assetCtx.markPx) - parseFloat(assetCtx.prevDayPx)) / parseFloat(assetCtx.prevDayPx)) * 100
                  : 0,
                lastUpdate: new Date(),
              };
              setMarketData(data);
            }
          } catch (err) {
            console.error('Error refreshing market data:', err);
          }
        }, 30000);

        setIsLoading(false);

        return () => {
          clearInterval(refreshInterval);
        };
      } catch (err) {
        console.error('Error initializing market data:', err);
        if (mounted) {
          setError('Failed to load market data');
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeMarketData();

    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
      wsClient.unsubscribe('allMids');
    };
  }, [currentAsset]);

  return { marketData, isLoading, error };
}
