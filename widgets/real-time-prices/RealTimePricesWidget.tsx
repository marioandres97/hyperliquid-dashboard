'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';

interface PriceData {
  coin: string;
  price: number;
  change24h: number;
  isConnected: boolean;
}

const COINS = ['BTC', 'ETH', 'HYPE'];

export default function RealTimePricesWidget() {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let priceHistory: Record<string, number[]> = {};

    const connect = () => {
      try {
        ws = new WebSocket('wss://api.hyperliquid.xyz/ws');

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          
          // Subscribe to allMids channel
          ws?.send(JSON.stringify({
            method: 'subscribe',
            subscription: {
              type: 'allMids'
            }
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Check if this is the allMids data
            if (data.channel === 'allMids' && data.data?.mids) {
              const mids = data.data.mids;
              const newPrices: Record<string, PriceData> = {};

              COINS.forEach(coin => {
                const priceStr = mids[coin];
                if (priceStr) {
                  const currentPrice = parseFloat(priceStr);
                  
                  // Initialize price history for this coin if needed
                  if (!priceHistory[coin]) {
                    priceHistory[coin] = [];
                  }
                  
                  // Add current price to history
                  priceHistory[coin].push(currentPrice);
                  
                  // Keep only last 50 prices for recent change tracking
                  if (priceHistory[coin].length > 50) {
                    priceHistory[coin].shift();
                  }
                  
                  // Calculate recent change percentage (using first price in history as baseline)
                  // Note: This represents change since connection, not actual 24h change
                  let change24h = 0;
                  if (priceHistory[coin].length > 1) {
                    const oldPrice = priceHistory[coin][0];
                    change24h = ((currentPrice - oldPrice) / oldPrice) * 100;
                  }

                  newPrices[coin] = {
                    coin,
                    price: currentPrice,
                    change24h,
                    isConnected: true
                  };
                }
              });

              setPrices(prev => ({
                ...prev,
                ...newPrices
              }));
            }
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setIsConnected(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between pb-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-white">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COINS.map(coin => {
          const priceData = prices[coin];
          const hasData = priceData && priceData.price > 0;
          const isPositive = hasData && priceData.change24h >= 0;

          return (
            <div
              key={coin}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Coin Name */}
              <div className="text-lg font-bold text-white mb-2">
                {coin}
              </div>

              {/* Price */}
              {hasData ? (
                <>
                  <div className="text-2xl font-bold text-white mb-2">
                    ${priceData.price.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>

                  {/* Change Indicator */}
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-white/60">
                  {isConnected ? 'Loading...' : 'Connecting...'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
