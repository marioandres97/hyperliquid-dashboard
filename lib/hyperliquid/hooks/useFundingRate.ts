'use client';

import { useState, useEffect } from 'react';
import { infoClient } from '../client';

export interface FundingRate {
  coin: string;
  fundingRate: number;
  premium: number;
  timestamp: Date;
}

export function useFundingRate(coin: string = 'BTC') {
  const [fundingRate, setFundingRate] = useState<FundingRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFundingRate = async () => {
      try {
        setIsLoading(true);
        const data = await infoClient.metaAndAssetCtxs();
        
        if (!isMounted) return;

        // data is [meta, assetCtxs]
        // meta.universe is an array of assets
        const meta = data[0];
        const assetCtxs = data[1];
        
        const coinIndex = meta.universe.findIndex((u: any) => u.name === coin);
        
        if (coinIndex !== -1 && assetCtxs[coinIndex]) {
          const coinData = assetCtxs[coinIndex];
          setFundingRate({
            coin: coin,
            fundingRate: parseFloat(coinData.funding),
            premium: parseFloat(coinData.premium || '0'),
            timestamp: new Date(),
          });
        }
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch funding rate'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchFundingRate();

    // Update every 30 seconds
    const interval = setInterval(fetchFundingRate, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [coin]);

  return { fundingRate, isLoading, error };
}
