'use client';

import { useState, useEffect, useRef } from 'react';
import { Coin, PriceData } from './types';

const COINS: Coin[] = ['BTC', 'ETH', 'HYPE'];

export function useRealTimePrices() {
  const [prices, setPrices] = useState<Record<Coin, PriceData>>({
    BTC: { coin: 'BTC', price: 0, change24h: 0, lastUpdate: new Date() },
    ETH: { coin: 'ETH', price: 0, change24h: 0, lastUpdate: new Date() },
    HYPE: { coin: 'HYPE', price: 0, change24h: 0, lastUpdate: new Date() },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const initialPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Real-time prices WebSocket connected');
      setIsConnected(true);
      
      // Subscribe to all mids (prices)
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'allMids' }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.channel === 'allMids' && message.data?.mids) {
          const mids = message.data.mids;
          const now = new Date();
          
          // Store initial prices for 24h change calculation
          if (Object.keys(initialPricesRef.current).length === 0) {
            COINS.forEach(coin => {
              if (mids[coin]) {
                initialPricesRef.current[coin] = parseFloat(mids[coin]);
              }
            });
          }

          // Update prices for our tracked coins
          setPrices(prev => {
            const updated = { ...prev };
            
            COINS.forEach(coin => {
              if (mids[coin]) {
                const currentPrice = parseFloat(mids[coin]);
                const initialPrice = initialPricesRef.current[coin] || currentPrice;
                const change24h = initialPrice ? ((currentPrice - initialPrice) / initialPrice) * 100 : 0;
                
                updated[coin] = {
                  coin,
                  price: currentPrice,
                  change24h,
                  lastUpdate: now,
                };
              }
            });
            
            return updated;
          });
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { prices, isLoading, isConnected };
}
