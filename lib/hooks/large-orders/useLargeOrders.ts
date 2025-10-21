'use client';

import { useState, useCallback, useEffect } from 'react';
import { useOptimizedTrades } from '@/lib/hooks/shared/useOptimizedWebSocket';
import type { Trade } from '@/lib/hyperliquid/WebSocketManager';
import type { LargeOrder, LargeOrderFilters, SizeFilter } from '@/lib/large-orders/types';
import { tradeToLargeOrder, isLargeOrder, filterLargeOrders } from '@/lib/large-orders/types';
import { whaleTradeTracker } from '@/lib/services/whaleTradeTracker';

const MAX_ORDERS = 100;
const DEFAULT_MIN_SIZE: SizeFilter = 100000;

export function useLargeOrders(
  coin: string = 'BTC',
  filters: LargeOrderFilters = {}
) {
  const [largeOrders, setLargeOrders] = useState<LargeOrder[]>([]);
  const minSize = filters.minSize || DEFAULT_MIN_SIZE;

  const handleTrades = useCallback(
    (trades: Trade[]) => {
      const newLargeOrders: LargeOrder[] = [];

      trades.forEach((trade) => {
        const order = tradeToLargeOrder(trade, coin);
        
        // Only add if it's a large order
        if (isLargeOrder(order.usdValue, minSize)) {
          newLargeOrders.push(order);
          
          // Track whale trades in database (async, no await)
          whaleTradeTracker.trackTrade({
            asset: order.coin,
            side: order.side,
            price: order.price,
            size: order.size,
            timestamp: new Date(order.timestamp),
            tradeId: order.id,
            priceImpact: order.priceImpact,
          }).catch(error => {
            console.error('Failed to track whale trade:', error);
          });
        }
      });

      if (newLargeOrders.length > 0) {
        setLargeOrders((prev) => {
          const combined = [...newLargeOrders, ...prev];
          // Keep only the latest MAX_ORDERS
          return combined.slice(0, MAX_ORDERS);
        });
      }
    },
    [coin, minSize]
  );

  // Subscribe to trades for the specified coin
  const { connected } = useOptimizedTrades(
    coin,
    handleTrades,
    500, // Update every 500ms
    true
  );

  // Apply filters to displayed orders
  const filteredOrders = filterLargeOrders(largeOrders, filters);

  return {
    largeOrders: filteredOrders,
    allOrders: largeOrders,
    connected,
  };
}

/**
 * Hook for monitoring multiple coins simultaneously
 */
export function useMultiCoinLargeOrders(
  coins: string[] = ['BTC', 'ETH', 'HYPE'],
  filters: LargeOrderFilters = {}
) {
  const [allLargeOrders, setAllLargeOrders] = useState<LargeOrder[]>([]);
  const minSize = filters.minSize || DEFAULT_MIN_SIZE;

  // Subscribe to each coin
  coins.forEach((coin) => {
    const handleTrades = useCallback(
      (trades: Trade[]) => {
        const newLargeOrders: LargeOrder[] = [];

        trades.forEach((trade) => {
          const order = tradeToLargeOrder(trade, coin);
          
          if (isLargeOrder(order.usdValue, minSize)) {
            newLargeOrders.push(order);
            
            // Track whale trades in database (async, no await)
            whaleTradeTracker.trackTrade({
              asset: order.coin,
              side: order.side,
              price: order.price,
              size: order.size,
              timestamp: new Date(order.timestamp),
              tradeId: order.id,
              priceImpact: order.priceImpact,
            }).catch(error => {
              console.error('Failed to track whale trade:', error);
            });
          }
        });

        if (newLargeOrders.length > 0) {
          setAllLargeOrders((prev) => {
            const combined = [...newLargeOrders, ...prev];
            // Sort by timestamp descending
            combined.sort((a, b) => b.timestamp - a.timestamp);
            return combined.slice(0, MAX_ORDERS);
          });
        }
      },
      [coin, minSize]
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useOptimizedTrades(coin, handleTrades, 500, true);
  });

  // Apply filters
  const filteredOrders = filterLargeOrders(allLargeOrders, filters);

  return {
    largeOrders: filteredOrders,
    allOrders: allLargeOrders,
  };
}
