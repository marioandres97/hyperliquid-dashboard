'use client';

import { useState, useEffect, useRef } from 'react';

export interface Trade {
  coin: string;
  side: boolean; // true = buy, false = sell
  px: string;
  sz: string;
  time: number;
  hash: string;
}

export interface ProcessedTrade {
  id: string;
  timestamp: Date;
  coin: string;
  direction: 'BUY' | 'SELL';
  price: number;
  volume: number;
  value: number; // price * volume
}

export function useTrades(coin: string = 'BTC') {
  const [trades, setTrades] = useState<ProcessedTrade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectToWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [coin]);

  const connectToWebSocket = () => {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Trades WebSocket connected for ${coin}`);
      setIsConnected(true);
      
      // Subscribe to trades for the specified coin
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { 
          type: 'trades',
          coin: coin
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.channel === 'trades' && data.data) {
          const rawTrades: Trade[] = Array.isArray(data.data) ? data.data : [data.data];
          
          const processedTrades: ProcessedTrade[] = rawTrades.map((trade) => ({
            id: trade.hash || `${trade.time}-${Math.random()}`,
            timestamp: new Date(trade.time),
            coin: trade.coin,
            direction: trade.side ? 'BUY' : 'SELL',
            price: parseFloat(trade.px),
            volume: parseFloat(trade.sz),
            value: parseFloat(trade.px) * parseFloat(trade.sz),
          }));

          setTrades(prev => {
            // Add new trades and keep last 100
            const combined = [...processedTrades, ...prev];
            return combined.slice(0, 100);
          });
        }
      } catch (error) {
        console.error('Error processing trade data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Trades WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Trades WebSocket closed, reconnecting...');
      setIsConnected(false);
      
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectToWebSocket();
      }, 5000);
    };
  };

  return { trades, isConnected };
}
