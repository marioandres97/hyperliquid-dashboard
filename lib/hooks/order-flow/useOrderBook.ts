'use client';

import { useState, useCallback } from 'react';
import { useOptimizedOrderBook } from '@/lib/hooks/shared/useOptimizedWebSocket';
import type { OrderBookSnapshot } from '@/lib/hyperliquid/WebSocketManager';
import type { OrderBookData } from '@/lib/order-flow/types';
import { parseOrderBook } from '@/lib/order-flow/types';

export function useOrderBook(coin: string = 'BTC') {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);

  const handleOrderBook = useCallback(
    (snapshot: OrderBookSnapshot) => {
      const parsed = parseOrderBook(snapshot, coin);
      setOrderBook(parsed);
    },
    [coin]
  );

  const { connected, quality } = useOptimizedOrderBook(
    coin,
    handleOrderBook,
    1000, // Update every second
    true
  );

  return {
    orderBook,
    connected,
    quality,
  };
}
