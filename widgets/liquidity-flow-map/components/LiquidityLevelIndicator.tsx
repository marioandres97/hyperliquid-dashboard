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
      name: 'Ballenas',
      count: metrics.whaleTradeCount,
      percent: whalePercent,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-500',
      icon: '🐋',
      description: 'Operaciones grandes',
    },
    {
      name: 'Regulares',
      count: totalTrades - metrics.whaleTradeCount,
      percent: 100 - whalePercent,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-500',
      icon: '🐟',
      description: 'Operaciones estándar',
    },
    {
      name: 'Compras',
      count: metrics.buyTradeCount,
      percent: buyPercent,
      bgColor: 'bg-green-500',
      textColor: 'text-green-500',
      icon: '⬆️',
      description: 'Lado comprador',
    },
    {
      name: 'Ventas',
      count: metrics.sellTradeCount,
      percent: sellPercent,
      bgColor: 'bg-red-500',
      textColor: 'text-red-500',
      icon: '⬇️',
      description: 'Lado vendedor',
    },
  ];

  return (
    <div className="glass rounded-xl p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Distribución de Operaciones</h3>
      
      {/* Visual Bar with better visibility */}
      <div className="mb-4 space-y-3">
        {/* Whale vs Regular */}
        <div>
          <div className="text-xs text-white/60 mb-1">Tipo de Operación</div>
          <div className="flex h-10 rounded-lg overflow-hidden shadow-lg">
            {[levels[0], levels[1]].map((level, index) => (
              level.percent > 0 && (
                <div
                  key={index}
                  className={`${level.bgColor} flex items-center justify-center text-white text-sm font-bold transition-all hover:opacity-80 cursor-pointer`}
                  style={{ width: `${level.percent}%`, minWidth: '40px' }}
                  title={`${level.name}: ${level.percent.toFixed(1)}%`}
                >
                  <span className="hidden sm:inline">{level.icon}</span>
                  <span className="ml-1">{level.percent.toFixed(0)}%</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Buy vs Sell */}
        <div>
          <div className="text-xs text-white/60 mb-1">Dirección</div>
          <div className="flex h-10 rounded-lg overflow-hidden shadow-lg">
            {[levels[2], levels[3]].map((level, index) => (
              level.percent > 0 && (
                <div
                  key={index}
                  className={`${level.bgColor} flex items-center justify-center text-white text-sm font-bold transition-all hover:opacity-80 cursor-pointer`}
                  style={{ width: `${level.percent}%`, minWidth: '40px' }}
                  title={`${level.name}: ${level.percent.toFixed(1)}%`}
                >
                  <span className="hidden sm:inline">{level.icon}</span>
                  <span className="ml-1">{level.percent.toFixed(0)}%</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Level Details - Compact Grid */}
      <div className="grid grid-cols-2 gap-2">
        {levels.map((level, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{level.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{level.name}</div>
                <div className="text-xs text-white/60 truncate">{level.description}</div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-lg font-bold text-white">{level.count}</div>
              </div>
              <div className={`text-base font-bold ${level.textColor}`}>
                {level.percent.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
