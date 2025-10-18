'use client';

import { useState, useEffect } from 'react';
import { infoClient } from '../client';

export interface MarketMetrics {
  coin: string;
  markPrice: number;
  openInterest: number;
  volume24h: number;
  fundingRate: number;
  prevDayPrice: number;
  priceChange24h: number;
  timestamp: Date;
}

export function useMarketMetrics(coin: string = 'BTC') {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const data = await infoClient.metaAndAssetCtxs();
        
        if (!isMounted) return;

        // data is [meta, assetCtxs]
        const meta = data[0];
        const assetCtxs = data[1];
        
        const coinIndex = meta.universe.findIndex((u: any) => u.name === coin);
        
        if (coinIndex !== -1 && assetCtxs[coinIndex]) {
          const coinData = assetCtxs[coinIndex];
          const markPrice = parseFloat(coinData.markPx);
          const prevDayPrice = parseFloat(coinData.prevDayPx);
          const priceChange24h = ((markPrice - prevDayPrice) / prevDayPrice) * 100;

          setMetrics({
            coin: coin,
            markPrice,
            openInterest: parseFloat(coinData.openInterest),
            volume24h: parseFloat(coinData.dayNtlVlm),
            fundingRate: parseFloat(coinData.funding),
            prevDayPrice,
            priceChange24h,
            timestamp: new Date(),
          });
        }
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch market metrics'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchMetrics();

    // Update every 10 seconds
    const interval = setInterval(fetchMetrics, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [coin]);

  return { metrics, isLoading, error };
}
