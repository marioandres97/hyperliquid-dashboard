import { useState, useEffect, useRef } from 'react';
import { OHLCCandle } from '@/lib/hyperliquid/types';

const COINS = ['BTC', 'ETH', 'HYPE'];
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const MINUTE_UPDATE_INTERVAL = 60 * 1000; // 1 minute in milliseconds

export function useCandleData() {
  const [candles, setCandles] = useState<Record<string, OHLCCandle[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const minuteUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch just the current/latest candle for updating the most recent one
  const updateCurrentCandle = async () => {
    await Promise.all(COINS.map(async (coin) => {
      try {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Fetch just the latest candle
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
              startTime: oneHourAgo,
              endTime: now,
            },
          }),
        });

        if (!response.ok) {
          console.debug(`Failed to update candle for ${coin}: ${response.statusText}`);
          return; // Silently fail for minute updates
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const latestCandle = data[data.length - 1];
          const candleData: OHLCCandle = {
            time: latestCandle.t,
            open: parseFloat(latestCandle.o),
            high: parseFloat(latestCandle.h),
            low: parseFloat(latestCandle.l),
            close: parseFloat(latestCandle.c),
            volume: parseFloat(latestCandle.v || '0'),
          };

          // Update the latest candle in state
          setCandles(prev => {
            const existing = prev[coin] || [];
            if (existing.length === 0) return prev;

            // Check if this is an update to the current candle or a new one
            const lastCandle = existing[existing.length - 1];
            const isSameCandle = Math.abs(lastCandle.time - candleData.time) < MINUTE_UPDATE_INTERVAL; // Within same minute

            if (isSameCandle) {
              // Update existing candle
              const updated = [...existing];
              updated[updated.length - 1] = candleData;
              return { ...prev, [coin]: updated };
            } else {
              // Add new candle and keep last 24
              const updated = [...existing, candleData].slice(-24);
              return { ...prev, [coin]: updated };
            }
          });
        }
      } catch (err) {
        // Log debug info for minute update failures
        console.debug(`Failed to update current candle for ${coin}:`, err instanceof Error ? err.message : 'Unknown error');
      }
    }));
  };

  useEffect(() => {
    // Initial fetch
    fetchAllCandles();

    // Set up auto-refresh every 1 hour for full data
    refreshIntervalRef.current = setInterval(() => {
      fetchAllCandles();
    }, REFRESH_INTERVAL);

    // Set up minute updates for current candle
    minuteUpdateIntervalRef.current = setInterval(() => {
      updateCurrentCandle();
    }, MINUTE_UPDATE_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (minuteUpdateIntervalRef.current) {
        clearInterval(minuteUpdateIntervalRef.current);
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
