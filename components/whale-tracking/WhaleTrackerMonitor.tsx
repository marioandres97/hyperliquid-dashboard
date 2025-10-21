'use client';

/**
 * Whale Tracker WebSocket Monitor
 * 
 * Client-side component that monitors BTC and ETH trades via WebSocket
 * and tracks whale trades to the database
 */

import { useEffect, useRef } from 'react';
import { getWebSocketManager, Trade } from '@/lib/hyperliquid/WebSocketManager';
import { config } from '@/lib/core/config';

interface BatchedTrade {
  asset: string;
  trade: Trade;
  timestamp: Date;
}

export function WhaleTrackerMonitor() {
  const wsManager = useRef(getWebSocketManager());
  const tradeBatch = useRef<BatchedTrade[]>([]);
  const subscriptionsRef = useRef<string[]>([]);
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return;
    
    // Check if whale tracking is enabled
    if (!config.whaleTracking.enabled || !config.whaleTracking.autoStart) {
      console.log('Whale tracking is disabled or auto-start is off');
      return;
    }

    const monitoredAssets = config.whaleTracking.monitoredAssets;
    const batchInterval = config.whaleTracking.batchInterval;

    async function initializeTracking() {
      try {
        console.log('Initializing whale tracker WebSocket monitoring', {
          assets: monitoredAssets,
          batchInterval,
        });

        // Connect WebSocket Manager
        await wsManager.current.connect();

        // Subscribe to trades for each monitored asset
        for (const asset of monitoredAssets) {
          try {
            const subscriptionKey = await wsManager.current.subscribe(
              'trades',
              asset,
              (trades: Trade[]) => {
                handleTrades(asset, trades);
              }
            );
            subscriptionsRef.current.push(subscriptionKey);
            console.log(`Subscribed to ${asset} trades`);
          } catch (error) {
            console.error(`Failed to subscribe to ${asset} trades:`, error);
          }
        }

        // Start batch processing timer
        batchTimerRef.current = setInterval(() => {
          flushBatch();
        }, batchInterval);

        isInitialized.current = true;
        console.log('Whale tracker WebSocket monitoring started successfully');
      } catch (error) {
        console.error('Failed to initialize whale tracker monitoring:', error);
      }
    }

    function handleTrades(asset: string, trades: Trade[]) {
      // Add trades to batch
      for (const trade of trades) {
        tradeBatch.current.push({
          asset,
          trade,
          timestamp: new Date(trade.time),
        });
      }
    }

    async function flushBatch() {
      if (tradeBatch.current.length === 0) {
        return;
      }

      const batchToProcess = [...tradeBatch.current];
      tradeBatch.current = [];

      console.log(`Processing batch of ${batchToProcess.length} trades`);

      // Send trades to API for processing
      try {
        const trades = batchToProcess.map(({ asset, trade, timestamp }) => ({
          asset,
          side: trade.side === 'A' ? 'BUY' : 'SELL',
          price: parseFloat(trade.px),
          size: parseFloat(trade.sz),
          timestamp: timestamp.toISOString(),
          tradeId: trade.tid?.toString(),
          metadata: {
            coin: trade.coin,
            originalSide: trade.side,
          },
        }));

        const response = await fetch('/api/whale-trades/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trades }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Batch processed successfully:', result);
        } else {
          console.error('Failed to process batch:', response.statusText);
        }
      } catch (error) {
        console.error('Error processing batch:', error);
      }
    }

    // Initialize tracking
    initializeTracking();

    // Cleanup on unmount
    return () => {
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
        batchTimerRef.current = null;
      }

      // Unsubscribe from all assets
      for (const subscription of subscriptionsRef.current) {
        wsManager.current.unsubscribe(subscription);
      }
      subscriptionsRef.current = [];

      isInitialized.current = false;
    };
  }, []);

  // This component doesn't render anything
  return null;
}
