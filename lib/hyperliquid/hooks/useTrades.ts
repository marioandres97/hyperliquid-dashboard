'use client';

import { useEffect, useState, useCallback } from 'react';
import { getWSClient, Trade } from '../websocket';
import { useAssetStore } from '@/lib/stores/assetStore';

export interface ProcessedTrade {
  id: number;
  timestamp: Date;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  notional: number;
  isLarge: boolean;
}

export interface TradeStats {
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  avgBuyPrice: number;
  avgSellPrice: number;
  volumeRatio: number;
  largeTradeCount: number;
}

const LARGE_TRADE_THRESHOLD = 10; // Configurable threshold for "large" trades

export function useTrades(maxTrades: number = 100) {
  const currentAsset = useAssetStore((state) => state.currentAsset);
  const [trades, setTrades] = useState<ProcessedTrade[]>([]);
  const [stats, setStats] = useState<TradeStats>({
    buyVolume: 0,
    sellVolume: 0,
    totalVolume: 0,
    avgBuyPrice: 0,
    avgSellPrice: 0,
    volumeRatio: 0,
    largeTradeCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processTrade = useCallback((rawTrade: Trade): ProcessedTrade => {
    const price = parseFloat(rawTrade.px);
    const size = parseFloat(rawTrade.sz);
    
    return {
      id: rawTrade.tid,
      timestamp: new Date(rawTrade.time),
      price,
      size,
      side: rawTrade.side === 'B' ? 'BUY' : 'SELL',
      notional: price * size,
      isLarge: size >= LARGE_TRADE_THRESHOLD,
    };
  }, []);

  const calculateStats = useCallback((tradeList: ProcessedTrade[]): TradeStats => {
    let buyVolume = 0;
    let sellVolume = 0;
    let buyPriceSum = 0;
    let sellPriceSum = 0;
    let buyCount = 0;
    let sellCount = 0;
    let largeTradeCount = 0;

    tradeList.forEach(trade => {
      if (trade.side === 'BUY') {
        buyVolume += trade.size;
        buyPriceSum += trade.price;
        buyCount++;
      } else {
        sellVolume += trade.size;
        sellPriceSum += trade.price;
        sellCount++;
      }
      
      if (trade.isLarge) {
        largeTradeCount++;
      }
    });

    const totalVolume = buyVolume + sellVolume;
    const avgBuyPrice = buyCount > 0 ? buyPriceSum / buyCount : 0;
    const avgSellPrice = sellCount > 0 ? sellPriceSum / sellCount : 0;
    const volumeRatio = sellVolume > 0 ? buyVolume / sellVolume : 0;

    return {
      buyVolume,
      sellVolume,
      totalVolume,
      avgBuyPrice,
      avgSellPrice,
      volumeRatio,
      largeTradeCount,
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const wsClient = getWSClient();

    const initializeTrades = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Connect WebSocket if not already connected
        if (!wsClient.getConnectionStatus()) {
          await wsClient.connect();
        }

        // Subscribe to real-time trade updates
        wsClient.subscribeToTrades(currentAsset, (rawTrades: Trade[]) => {
          if (!mounted) return;

          const newTrades = rawTrades.map(processTrade);
          
          setTrades(prev => {
            const updated = [...newTrades, ...prev].slice(0, maxTrades);
            // Recalculate stats
            setStats(calculateStats(updated));
            return updated;
          });
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing trades:', err);
        if (mounted) {
          setError('Failed to load trades data');
          setIsLoading(false);
        }
      }
    };

    initializeTrades();

    return () => {
      mounted = false;
      wsClient.unsubscribe(`trades-${currentAsset}`);
    };
  }, [currentAsset, maxTrades, processTrade, calculateStats]);

  return { trades, stats, isLoading, error };
}
