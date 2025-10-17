import { useState, useEffect, useRef } from 'react';

const COINS = ['BTC', 'ETH', 'HYPE'];

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: number;
}

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState<Record<string, boolean>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const priceHistory = useRef<Record<string, number[]>>({});

  useEffect(() => {
    connectToWebSocket();

    return () => {
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

      COINS.forEach(coin => {
        setIsConnected(prev => ({ ...prev, [coin]: true }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.channel === 'allMids' && data.data?.mids) {
          const mids = data.data.mids;
          
          COINS.forEach(coin => {
            if (mids[coin]) {
              const price = parseFloat(mids[coin]);
              
              // Track price history for 24h change calculation
              if (!priceHistory.current[coin]) {
                priceHistory.current[coin] = [];
              }
              priceHistory.current[coin].push(price);
              
              // Keep last 100 prices
              if (priceHistory.current[coin].length > 100) {
                priceHistory.current[coin].shift();
              }
              
              const history = priceHistory.current[coin];
              const oldPrice = history[0] || price;
              const change24h = ((price - oldPrice) / oldPrice) * 100;
              
              setPrices(prev => ({
                ...prev,
                [coin]: {
                  price,
                  change24h,
                  volume24h: prev[coin]?.volume24h || 0,
                  lastUpdate: Date.now()
                }
              }));
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
      
      // Reconnect after 5 seconds
      setTimeout(connectToWebSocket, 5000);
    };
  };

  return { prices, isConnected };
}
