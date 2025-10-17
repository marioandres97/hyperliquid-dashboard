import { useState, useEffect, useRef } from 'react';
import { HyperliquidAPI } from '@nktkas/hyperliquid';

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
  const wsConnections = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    COINS.forEach(coin => {
      connectToCoin(coin);
    });

    return () => {
      wsConnections.current.forEach((ws) => {
        if (ws && ws.destroy) {
          ws.destroy();
        }
      });
      wsConnections.current.clear();
    };
  }, []);

  const connectToCoin = async (coin: string) => {
    try {
      const ws = await HyperliquidAPI.ws.allMids({
        callback: (data) => {
          const mids = data.data?.mids;
          if (!mids) return;

          const coinData = mids[coin];
          if (coinData) {
            const price = parseFloat(coinData);
            
            setPrices(prev => {
              const oldPrice = prev[coin]?.price || price;
              const change24h = ((price - oldPrice) / oldPrice) * 100;
              
              return {
                ...prev,
                [coin]: {
                  price,
                  change24h: prev[coin]?.change24h || 0,
                  volume24h: prev[coin]?.volume24h || 0,
                  lastUpdate: Date.now()
                }
              };
            });

            setIsConnected(prev => ({ ...prev, [coin]: true }));
          }
        }
      });

      wsConnections.current.set(coin, ws);
    } catch (error) {
      console.error(`Failed to connect to ${coin}:`, error);
      setIsConnected(prev => ({ ...prev, [coin]: false }));
    }
  };

  return { prices, isConnected };
}
