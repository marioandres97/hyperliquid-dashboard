'use client';

import { usePrices } from './usePrices';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const COINS = ['BTC', 'ETH', 'HYPE'];

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();

  return (
    <div className="h-full flex flex-col space-y-3">
      {COINS.map(coin => {
        const data = prices[coin];
        const connected = isConnected[coin];
        const isPositive = data?.change24h >= 0;

        return (
          <div
            key={coin}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-white/60" />
                <span className="text-lg font-bold text-white">{coin}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {data ? (
              <>
                <div className="text-3xl font-bold text-white mb-1.5">
                  ${data.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>

                <div className="flex items-center gap-2">
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
              </>
            ) : (
              <div className="text-white/60">Connecting...</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
