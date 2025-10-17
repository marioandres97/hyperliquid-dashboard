import { useState, useEffect, useRef } from 'react';

const COINS = ['BTC', 'ETH', 'HYPE'];

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: number;
}

interface PriceHistory {
  price: number;
  timestamp: number;
}

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const priceHistory = useRef<Record<string, PriceHistory[]>>({});
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
  }, []);

  const connectToWebSocket = () => {
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Prices WebSocket connected');
      
      // Subscribe to all mids for all coins
      ws.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'allMids' }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.channel === 'allMids' && data.data?.mids) {
          const mids = data.data.mids;
          const now = Date.now();
          const oneDayAgo = now - (24 * 60 * 60 * 1000);
          
          COINS.forEach(coin => {
            if (mids[coin]) {
              const price = parseFloat(mids[coin]);
              
              // Track price history with timestamps
              if (!priceHistory.current[coin]) {
                priceHistory.current[coin] = [];
              }
              priceHistory.current[coin].push({ price, timestamp: now });
              
              // Remove prices older than 24 hours + some buffer
              priceHistory.current[coin] = priceHistory.current[coin].filter(
                entry => entry.timestamp > oneDayAgo - (60 * 60 * 1000) // Keep 25 hours
              );
              
              const history = priceHistory.current[coin];
              
              // Find the price closest to 24 hours ago
              let oldPrice = price;
              if (history.length > 1) {
                const oldestEntry = history.reduce((prev, curr) => 
                  Math.abs(curr.timestamp - oneDayAgo) < Math.abs(prev.timestamp - oneDayAgo) 
                    ? curr 
                    : prev
                );
                oldPrice = oldestEntry.price;
              }
              
              const change24h = ((price - oldPrice) / oldPrice) * 100;
              
              setPrices(prev => ({
                ...prev,
                [coin]: {
                  price,
                  change24h,
                  volume24h: prev[coin]?.volume24h || 0,
                  lastUpdate: now
                }
              }));

              // Set connection status to true when data is received
              setIsConnected(prev => ({ ...prev, [coin]: true }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing price data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Prices WebSocket error:', error);
      COINS.forEach(coin => {
        setIsConnected(prev => ({ ...prev, [coin]: false }));
      });
    };

    ws.onclose = () => {
      console.log('Prices WebSocket closed, reconnecting...');
      COINS.forEach(coin => {
        setIsConnected(prev => ({ ...prev, [coin]: false }));
      });
      
      // Reconnect after 5 seconds with timeout tracking
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectToWebSocket();
      }, 5000);
    };
  };

  return { prices, isConnected };
}
