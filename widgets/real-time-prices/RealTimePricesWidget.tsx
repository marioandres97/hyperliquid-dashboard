'use client';

import { useState, useEffect } from 'react';
import { usePrices } from './usePrices';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COINS = ['BTC', 'ETH', 'HYPE'];

// Volume data mapping
const VOLUME_DATA: Record<string, string> = {
  BTC: '$2.4B',
  ETH: '$1.2B',
  HYPE: '$45M',
};

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationTime(prev => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-3">
      {COINS.map(coin => {
        const data = prices[coin];
        const connected = isConnected[coin];
        const isPositive = data?.change24h >= 0;

        return (
          <div
            key={coin}
            className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-white/60" />
                <span className="text-lg font-bold text-white">{coin}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {data ? (
              <>
                <div className="text-3xl font-bold text-white mb-2">
                  ${data.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
                  </span>
                  <span className="text-xs text-white/50">24h</span>
                </div>

                {/* Mini Price Chart Sparkline */}
                <div className="mb-3">
                  <div className="text-xs text-white/50 mb-1.5">24h Price Action</div>
                  <div className="flex items-end gap-0.5 h-16">
                    {[...Array(20)].map((_, i) => {
                      const height = 20 + Math.abs(Math.sin((i + animationTime) * 0.5)) * 40;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-t ${
                            isPositive ? 'bg-green-400/40' : 'bg-red-400/40'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-white/50 mb-0.5">24h High</div>
                    <div className="text-sm font-semibold text-green-400 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      ${(data.price * (1 + Math.abs(data.change24h) / 100)).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-white/50 mb-0.5">24h Low</div>
                    <div className="text-sm font-semibold text-red-400 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" />
                      ${(data.price * (1 - Math.abs(data.change24h) / 100)).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Volume indicator */}
                <div className="mt-2 bg-white/5 rounded-lg p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Volume</span>
                    <span className="text-white font-medium">
                      {VOLUME_DATA[coin] || 'N/A'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-white/60">Connecting...</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
