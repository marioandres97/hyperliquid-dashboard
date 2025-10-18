'use client';

import { useState, useEffect, useRef } from 'react';

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBookSnapshot {
  coin: string;
  levels: [OrderBookLevel[], OrderBookLevel[]]; // [bids, asks]
  time: number;
}

export interface ProcessedOrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  midPrice: number;
  timestamp: Date;
}

export function useOrderBook(coin: string = 'BTC') {
  const [orderBook, setOrderBook] = useState<ProcessedOrderBook | null>(null);
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
      console.log(`Order Book WebSocket connected for ${coin}`);
      setIsConnected(true);
      
      // Subscribe to L2 order book for the specified coin
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { 
          type: 'l2Book',
          coin: coin
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.channel === 'l2Book' && data.data) {
          const snapshot = data.data as OrderBookSnapshot;
          const [rawBids, rawAsks] = snapshot.levels;

          // Process bids and asks
          const bids: OrderBookLevel[] = rawBids.map(level => ({
            price: parseFloat(level.price as any),
            size: parseFloat(level.size as any),
          }));

          const asks: OrderBookLevel[] = rawAsks.map(level => ({
            price: parseFloat(level.price as any),
            size: parseFloat(level.size as any),
          }));

          // Calculate mid price and spread
          const bestBid = bids[0]?.price || 0;
          const bestAsk = asks[0]?.price || 0;
          const midPrice = (bestBid + bestAsk) / 2;
          const spread = bestAsk - bestBid;

          setOrderBook({
            bids,
            asks,
            spread,
            midPrice,
            timestamp: new Date(snapshot.time),
          });
        }
      } catch (error) {
        console.error('Error processing order book data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Order Book WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Order Book WebSocket closed, reconnecting...');
      setIsConnected(false);
      
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectToWebSocket();
      }, 5000);
    };
  };

  return { orderBook, isConnected };
}
