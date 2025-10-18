/**
 * Hook for managing candlestick data collection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CandleData, ClassifiedTrade, Coin } from '../types';

export interface UseCandleDataOptions {
  coin: Coin;
  interval: number; // Candle interval in seconds (e.g., 60 for 1-minute candles)
  maxCandles?: number; // Maximum number of candles to keep in memory
}

export interface UseCandleDataReturn {
  candles: CandleData[];
  currentCandle: CandleData | null;
  addTrade: (trade: ClassifiedTrade) => void;
  clearCandles: () => void;
}

/**
 * Hook for managing candle data
 */
export function useCandleData({
  coin,
  interval = 60, // Default 1-minute candles
  maxCandles = 100,
}: UseCandleDataOptions): UseCandleDataReturn {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize a new candle
   */
  const initializeCandle = useCallback((timestamp: number, price: number): CandleData => {
    const candleTimestamp = Math.floor(timestamp / (interval * 1000)) * (interval * 1000);
    return {
      timestamp: candleTimestamp,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0,
      side: 'neutral',
    };
  }, [interval]);

  /**
   * Update candle with trade data
   */
  const updateCandleWithTrade = useCallback((candle: CandleData, trade: ClassifiedTrade): CandleData => {
    return {
      ...candle,
      high: Math.max(candle.high, trade.price),
      low: Math.min(candle.low, trade.price),
      close: trade.price,
      volume: candle.volume + trade.notional,
      side: trade.side, // Use the side of the most recent trade
    };
  }, []);

  /**
   * Add a trade to the current candle
   */
  const addTrade = useCallback((trade: ClassifiedTrade) => {
    const candleTimestamp = Math.floor(trade.timestamp / (interval * 1000)) * (interval * 1000);

    setCurrentCandle((prevCandle) => {
      // If no current candle or trade belongs to a new candle period
      if (!prevCandle || prevCandle.timestamp !== candleTimestamp) {
        // Finalize previous candle if it exists
        if (prevCandle) {
          setCandles((prevCandles) => {
            const newCandles = [...prevCandles, prevCandle];
            // Keep only the most recent maxCandles
            return newCandles.slice(-maxCandles);
          });
        }

        // Create new candle
        return initializeCandle(trade.timestamp, trade.price);
      }

      // Update existing candle
      return updateCandleWithTrade(prevCandle, trade);
    });
  }, [interval, maxCandles, initializeCandle, updateCandleWithTrade]);

  /**
   * Periodically finalize completed candles
   */
  useEffect(() => {
    updateTimerRef.current = setInterval(() => {
      const now = Date.now();
      const currentCandleTimestamp = Math.floor(now / (interval * 1000)) * (interval * 1000);

      setCurrentCandle((prevCandle) => {
        if (prevCandle && prevCandle.timestamp < currentCandleTimestamp) {
          // Finalize the completed candle
          setCandles((prevCandles) => {
            const newCandles = [...prevCandles, prevCandle];
            return newCandles.slice(-maxCandles);
          });
          return null;
        }
        return prevCandle;
      });
    }, 1000); // Check every second

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [interval, maxCandles]);

  /**
   * Clear all candles
   */
  const clearCandles = useCallback(() => {
    setCandles([]);
    setCurrentCandle(null);
  }, []);

  return {
    candles,
    currentCandle,
    addTrade,
    clearCandles,
  };
}
