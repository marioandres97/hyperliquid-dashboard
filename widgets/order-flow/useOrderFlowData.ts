'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const tradesBufferRef = useRef<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

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
    const bucketSize = 60 * 1000;

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
    setIsLoading(true);
    tradesBufferRef.current = [];

    // Create WebSocket connection
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to trades
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'trades', coin }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.channel === 'trades' && Array.isArray(message.data)) {
          const now = Date.now();
          const cutoff = now - TIMEFRAME_MS[timeframe];

          const newTrades: Trade[] = message.data.map((trade: any) => ({
            coin: trade.coin,
            side: trade.side,
            px: trade.px,
            sz: trade.sz,
            time: trade.time,
            hash: trade.hash,
            tid: trade.tid,
          }));

          tradesBufferRef.current = [...tradesBufferRef.current, ...newTrades]
            .filter(t => t.time >= cutoff)
            .slice(-1000);

          setTrades(tradesBufferRef.current);
          setMetrics(calculateMetrics(tradesBufferRef.current));
          setDeltaTimeline(calculateDeltaTimeline(tradesBufferRef.current));
          setLastUpdate(new Date());
          setIsLoading(false);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [coin, timeframe, calculateMetrics, calculateDeltaTimeline]);

  return { trades, metrics, deltaTimeline, isLoading, lastUpdate };
}