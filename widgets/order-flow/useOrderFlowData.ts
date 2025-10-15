'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trade, OrderFlowMetrics, TimeframeDelta, Timeframe, Coin } from './types';

const TIMEFRAME_MS = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
};

const LARGE_TRADE_USD = 10000;

export function useOrderFlowData(coin: Coin, timeframe: Timeframe) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<OrderFlowMetrics | null>(null);
  const [deltaTimeline, setDeltaTimeline] = useState<TimeframeDelta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const calculateMetrics = useCallback((tradesList: Trade[]): OrderFlowMetrics => {
    let cvd = 0;
    let buyVolume = 0;
    let sellVolume = 0;
    let largeTradeCount = 0;

    tradesList.forEach(trade => {
      const volume = parseFloat(trade.sz);
      const price = parseFloat(trade.px);
      const notional = volume * price;

      if (trade.side === 'B') {
        buyVolume += volume;
        cvd += volume;
      } else {
        sellVolume += volume;
        cvd -= volume;
      }

      if (notional >= LARGE_TRADE_USD) {
        largeTradeCount++;
      }
    });

    const totalVolume = buyVolume + sellVolume;
    const buyRatio = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;

    return {
      cvd,
      buyVolume,
      sellVolume,
      buyRatio,
      totalVolume,
      tradeCount: tradesList.length,
      avgTradeSize: totalVolume / tradesList.length || 0,
      largeTradeCount,
    };
  }, []);

  const calculateDeltaTimeline = useCallback((tradesList: Trade[]): TimeframeDelta[] => {
    const buckets = new Map<number, { buyVol: number; sellVol: number }>();
    const bucketSize = 60 * 1000; // 1 minute buckets

    tradesList.forEach(trade => {
      const bucket = Math.floor(trade.time / bucketSize) * bucketSize;
      const volume = parseFloat(trade.sz);

      if (!buckets.has(bucket)) {
        buckets.set(bucket, { buyVol: 0, sellVol: 0 });
      }

      const data = buckets.get(bucket)!;
      if (trade.side === 'B') {
        data.buyVol += volume;
      } else {
        data.sellVol += volume;
      }
    });

    return Array.from(buckets.entries())
      .map(([timestamp, { buyVol, sellVol }]) => ({
        timestamp,
        delta: buyVol - sellVol,
        buyVol,
        sellVol,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, []);

  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with real WebSocket connection
        // For now, using REST endpoint for historical data
        const now = Date.now();
        const startTime = now - TIMEFRAME_MS[timeframe];

        const response = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'candleSnapshot',
            req: {
              coin,
              interval: '1m',
              startTime,
              endTime: now,
            },
          }),
        });

        // Simulated trades from candle data (will be replaced with WebSocket)
        const candles = await response.json();
        const simulatedTrades: Trade[] = candles.map((candle: any, i: number) => ({
          coin,
          side: i % 2 === 0 ? 'B' : 'A',
          px: candle.c,
          sz: (candle.v / 2).toString(),
          time: candle.t,
          hash: `sim_${i}`,
          tid: i,
        }));

        setTrades(simulatedTrades);
        setMetrics(calculateMetrics(simulatedTrades));
        setDeltaTimeline(calculateDeltaTimeline(simulatedTrades));
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [coin, timeframe, calculateMetrics, calculateDeltaTimeline]);

  return { trades, metrics, deltaTimeline, isLoading, lastUpdate };
}