'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface BigMetricCardProps {
  totalPnL: number;
  totalPnLPercent: number;
  totalTrades: number;
}

export function BigMetricCard({ totalPnL, totalPnLPercent, totalTrades }: BigMetricCardProps) {
  const isPositive = totalPnL >= 0;

  return (
    <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-8 md:col-span-2">
      <p className="text-gray-400 text-sm mb-3">Total PnL</p>
      <div className="flex items-baseline gap-4">
        <p className={`text-5xl font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}${Math.abs(totalPnL).toFixed(2)}
        </p>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-400" />
          )}
          <p className={`text-2xl ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(totalPnLPercent).toFixed(2)}%
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3">{totalTrades} trades</p>
    </div>
  );
}
