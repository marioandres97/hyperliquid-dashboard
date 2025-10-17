'use client';

import { useRealTimePrices } from './useRealTimePrices';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { COINS } from './types';

export default function RealTimePricesWidget() {
  const { prices, isLoading, isConnected } = useRealTimePrices();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading real-time prices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-white/60">
          {isConnected ? 'Live prices' : 'Disconnected'}
        </span>
      </div>

      {/* Price Cards - Vertical Layout */}
      <div className="flex-1 grid grid-cols-1 gap-3">
        {COINS.map((coin) => {
          const priceData = prices[coin];
          const isPositive = priceData.change24h >= 0;
          
          return (
            <div
              key={coin}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Coin Name and Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-semibold text-white">{coin}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white truncate">
                  ${priceData.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-xs text-white/50">
                  Last update: {priceData.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-white/50 text-center pt-2">
        Real-time data from Hyperliquid WebSocket
      </div>
    </div>
  );
}
