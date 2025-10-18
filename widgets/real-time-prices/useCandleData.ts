import { useState, useEffect, useRef } from 'react';
import { OHLCCandle } from '@/lib/hyperliquid/types';

const COINS = ['BTC', 'ETH', 'HYPE'];
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export function useCandleData() {
  const [candles, setCandles] = useState<Record<string, OHLCCandle[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCandlesForCoin = async (coin: string) => {
    setIsLoading(prev => ({ ...prev, [coin]: true }));
    setError(prev => ({ ...prev, [coin]: null }));

    try {
      const now = Date.now();
      const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

      // Fetch candle data from Hyperliquid API
      const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'candleSnapshot',
          req: {
            coin,
            interval: '1h',
            startTime: twentyFourHoursAgo,
            endTime: now,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch candles: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the data to our OHLCCandle format
      const candleData: OHLCCandle[] = (data as Array<{t: number, o: string, h: string, l: string, c: string, v?: string}>).map((candle) => ({
        time: candle.t,
        open: parseFloat(candle.o),
        high: parseFloat(candle.h),
        low: parseFloat(candle.l),
        close: parseFloat(candle.c),
        volume: parseFloat(candle.v || '0'),
      }));

      // Keep only the last 24 candles
      const last24Candles = candleData.slice(-24);

      setCandles(prev => ({ ...prev, [coin]: last24Candles }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Error fetching candles for ${coin}:`, errorMessage);
      setError(prev => ({ ...prev, [coin]: errorMessage }));
    } finally {
      setIsLoading(prev => ({ ...prev, [coin]: false }));
    }
  };

  const fetchAllCandles = async () => {
    await Promise.all(COINS.map(coin => fetchCandlesForCoin(coin)));
  };

  useEffect(() => {
    // Initial fetch
    fetchAllCandles();

    // Set up auto-refresh every 1 hour
    refreshIntervalRef.current = setInterval(() => {
      fetchAllCandles();
    }, REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const retry = (coin: string) => {
    fetchCandlesForCoin(coin);
  };

  return {
    candles,
    isLoading,
    error,
    retry,
  };
}
