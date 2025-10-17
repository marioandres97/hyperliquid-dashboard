'use client';

import React from 'react';
import type { FlowMetrics } from '../types';

export interface LiquidityLevelIndicatorProps {
  metrics: FlowMetrics | null;
}

export function LiquidityLevelIndicator({ metrics }: LiquidityLevelIndicatorProps) {
  if (!metrics) {
    return null;
  }

  const totalTrades = metrics.totalTrades || 1;
  const whalePercent = (metrics.whaleTradeCount / totalTrades) * 100;
  const buyPercent = (metrics.buyTradeCount / totalTrades) * 100;
  const sellPercent = (metrics.sellTradeCount / totalTrades) * 100;

  const levels = [
    {
      name: 'Whale',
      count: metrics.whaleTradeCount,
      percent: whalePercent,
      color: 'bg-purple-500',
      icon: '🐋',
      description: 'High volume trades',
    },
    {
      name: 'Regular',
      count: totalTrades - metrics.whaleTradeCount,
      percent: 100 - whalePercent,
      color: 'bg-blue-500',
      icon: '🐟',
      description: 'Standard trades',
    },
    {
      name: 'Buy',
      count: metrics.buyTradeCount,
      percent: buyPercent,
      color: 'bg-green-500',
      icon: '⬆️',
      description: 'Buy side trades',
    },
    {
      name: 'Sell',
      count: metrics.sellTradeCount,
      percent: sellPercent,
      color: 'bg-red-500',
      icon: '⬇️',
      description: 'Sell side trades',
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Trade Distribution</h3>
      
      {/* Visual Bar */}
      <div className="mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {levels.map((level, index) => (
            level.percent > 0 && (
              <div
                key={index}
                className={`${level.color} flex items-center justify-center text-white text-xs font-bold transition-all hover:opacity-80`}
                style={{ width: `${level.percent}%` }}
                title={`${level.name}: ${level.percent.toFixed(1)}%`}
              >
                {level.percent > 10 && `${level.percent.toFixed(0)}%`}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Level Details */}
      <div className="grid grid-cols-2 gap-4">
        {levels.map((level, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{level.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white">{level.name}</div>
                <div className="text-xs text-white/60">{level.description}</div>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold text-white">{level.count}</div>
                <div className="text-xs text-white/60">trades</div>
              </div>
              <div className={`text-xl font-bold ${level.color.replace('bg-', 'text-')}`}>
                {level.percent.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
