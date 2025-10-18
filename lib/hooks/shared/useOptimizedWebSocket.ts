'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getWebSocketManager } from '@/lib/hyperliquid/WebSocketManager';
import type { OrderBookSnapshot, Trade, AllMids } from '@/lib/hyperliquid/WebSocketManager';

/**
 * Throttle function to limit execution frequency
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: any;

  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

type SubscriptionType = 'l2Book' | 'trades' | 'allMids';

interface UseOptimizedWebSocketOptions<T> {
  type: SubscriptionType;
  coin?: string;
  throttleMs?: number;
  onData: (data: T) => void;
  enabled?: boolean;
}

/**
 * Optimized WebSocket hook with built-in throttling and automatic reconnection
 */
export function useOptimizedWebSocket<T = OrderBookSnapshot | Trade[] | AllMids>(
  options: UseOptimizedWebSocketOptions<T>
) {
  const {
    type,
    coin,
    throttleMs = 1000, // Default: max 1 update per second
    onData,
    enabled = true,
  } = options;

  const subscriptionKeyRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Create throttled handler
  const throttledHandler = useCallback(
    throttle((data: T) => {
      if (isMountedRef.current) {
        onData(data);
      }
    }, throttleMs),
    [onData, throttleMs]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      return;
    }

    const wsManager = getWebSocketManager();

    const setupSubscription = async () => {
      try {
        // Ensure connection
        if (!wsManager.getConnectionStatus()) {
          await wsManager.connect();
        }

        // Subscribe with throttled handler
        const key = await wsManager.subscribe(type, coin, throttledHandler);
        subscriptionKeyRef.current = key;
      } catch (error) {
        console.error('Error setting up WebSocket subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (subscriptionKeyRef.current) {
        wsManager.unsubscribe(subscriptionKeyRef.current);
        subscriptionKeyRef.current = null;
      }
    };
  }, [type, coin, enabled, throttledHandler]);

  // Return connection status and metrics
  return {
    connected: getWebSocketManager().getConnectionStatus(),
    quality: getWebSocketManager().getConnectionQuality(),
  };
}

/**
 * Hook to monitor WebSocket health
 */
export function useWebSocketHealth() {
  const wsManager = getWebSocketManager();

  useEffect(() => {
    const handleHealth = (health: any) => {
      // Can emit custom events or update state based on health
    };

    wsManager.on('health', handleHealth);

    return () => {
      wsManager.off('health', handleHealth);
    };
  }, [wsManager]);

  return wsManager.getMetrics();
}

/**
 * Hook for optimized order book subscription
 */
export function useOptimizedOrderBook(
  coin: string,
  onData: (data: OrderBookSnapshot) => void,
  throttleMs: number = 1000,
  enabled: boolean = true
) {
  return useOptimizedWebSocket<OrderBookSnapshot>({
    type: 'l2Book',
    coin,
    onData,
    throttleMs,
    enabled,
  });
}

/**
 * Hook for optimized trades subscription
 */
export function useOptimizedTrades(
  coin: string,
  onData: (data: Trade[]) => void,
  throttleMs: number = 1000,
  enabled: boolean = true
) {
  return useOptimizedWebSocket<Trade[]>({
    type: 'trades',
    coin,
    onData,
    throttleMs,
    enabled,
  });
}

/**
 * Hook for optimized all mids subscription
 */
export function useOptimizedAllMids(
  onData: (data: AllMids) => void,
  throttleMs: number = 2000, // Less frequent for all mids
  enabled: boolean = true
) {
  return useOptimizedWebSocket<AllMids>({
    type: 'allMids',
    onData,
    throttleMs,
    enabled,
  });
}
