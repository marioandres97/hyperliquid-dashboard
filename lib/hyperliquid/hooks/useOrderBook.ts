'use client';

import { useEffect, useState, useCallback } from 'react';
import { getWSClient, OrderBookSnapshot } from '../websocket';
import { getOrderBook } from '../client';
import { useAsset } from '@/lib/context/AssetContext';

export interface ProcessedOrderBookLevel {
  price: number;
  volume: number;
  accumulated: number;
  distanceFromPrice: number;
  total?: number;
}

export interface ProcessedOrderBook {
  bids: ProcessedOrderBookLevel[];
  asks: ProcessedOrderBookLevel[];
  currentPrice: number;
  spread: number;
  spreadPercent: number;
  lastUpdate: Date;
}

export function useOrderBook(maxLevels: number = 15) {
  const { currentAsset } = useAsset();
  const [orderBook, setOrderBook] = useState<ProcessedOrderBook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processOrderBook = useCallback((snapshot: OrderBookSnapshot): ProcessedOrderBook => {
    const [rawBids, rawAsks] = snapshot.levels;
    
    // Calculate mid price - convert string prices to numbers
    const bestBid = rawBids[0] ? parseFloat(rawBids[0].px) : 0;
    const bestAsk = rawAsks[0] ? parseFloat(rawAsks[0].px) : 0;
    const currentPrice = (bestBid + bestAsk) / 2;
    
    let accumulatedBid = 0;
    const bids: ProcessedOrderBookLevel[] = rawBids.slice(0, maxLevels).map((level) => {
      const price = parseFloat(level.px);
      const volume = parseFloat(level.sz);
      accumulatedBid += volume;
      return {
        price,
        volume,
        accumulated: accumulatedBid,
        distanceFromPrice: ((currentPrice - price) / currentPrice) * 100,
        total: volume,
      };
    });

    let accumulatedAsk = 0;
    const asks: ProcessedOrderBookLevel[] = rawAsks.slice(0, maxLevels).map((level) => {
      const price = parseFloat(level.px);
      const volume = parseFloat(level.sz);
      accumulatedAsk += volume;
      return {
        price,
        volume,
        accumulated: accumulatedAsk,
        distanceFromPrice: ((price - currentPrice) / currentPrice) * 100,
        total: volume,
      };
    });

    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / currentPrice) * 100;

    return {
      bids,
      asks,
      currentPrice,
      spread,
      spreadPercent,
      lastUpdate: new Date(),
    };
  }, [maxLevels]);

  useEffect(() => {
    let mounted = true;
    const wsClient = getWSClient();

    const initializeOrderBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, get initial snapshot via REST API
        const snapshot = await getOrderBook(currentAsset);
        if (mounted && snapshot) {
          const processed = processOrderBook({
            coin: currentAsset,
            levels: snapshot.levels,
            timestamp: snapshot.time || Date.now(),
          });
          setOrderBook(processed);
        }

        // Connect WebSocket if not already connected
        if (!wsClient.getConnectionStatus()) {
          await wsClient.connect();
        }

        // Subscribe to real-time updates
        wsClient.subscribeToOrderBook(currentAsset, (data: OrderBookSnapshot) => {
          if (mounted) {
            const processed = processOrderBook(data);
            setOrderBook(processed);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing order book:', err);
        if (mounted) {
          setError('Failed to load order book data');
          setIsLoading(false);
        }
      }
    };

    initializeOrderBook();

    return () => {
      mounted = false;
      wsClient.unsubscribe(`l2Book-${currentAsset}`);
    };
  }, [currentAsset, processOrderBook]);

  return { orderBook, isLoading, error };
}
