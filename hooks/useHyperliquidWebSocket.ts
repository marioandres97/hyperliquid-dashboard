'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHyperliquidWebSocket } from '@/lib/websocket/hyperliquid-ws';
import type { Trade } from '@/lib/hyperliquid/WebSocketManager';
import type { ConnectionState } from '@/types/large-orders';

export function useHyperliquidWebSocket(
  coins: string[],
  onTrades: (coin: string, trades: Trade[]) => void
) {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    quality: 'disconnected',
    lastUpdate: 0,
  });

  useEffect(() => {
    const ws = getHyperliquidWebSocket();
    let unsubTrades: (() => void) | undefined;
    
    // Subscribe to connection changes
    const unsubConnection = ws.onConnectionChange(setConnectionState);
    
    // Subscribe to trades for all coins (async)
    ws.subscribeMultipleCoins(coins, onTrades).then((unsub) => {
      unsubTrades = unsub;
    });
    
    return () => {
      unsubConnection();
      if (unsubTrades) {
        unsubTrades();
      }
    };
  }, [coins, onTrades]);

  const reconnect = useCallback(() => {
    const ws = getHyperliquidWebSocket();
    ws.reconnect();
  }, []);

  return {
    connectionState,
    reconnect,
  };
}
