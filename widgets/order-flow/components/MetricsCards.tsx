'use client';

import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { OrderFlowMetrics } from '../types';

interface MetricsCardsProps {
  metrics: OrderFlowMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const { cvd, totalVolume, tradeCount, avgTradeSize, largeTradeCount } = metrics;

  const cards = [
    {
      label: 'CVD',
      value: cvd.toFixed(2),
      icon: cvd >= 0 ? TrendingUp : TrendingDown,
      color: cvd >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: cvd >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: 'Total Volume',
      value: totalVolume.toFixed(2),
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Trades',
      value: tradeCount.toString(),
      icon: Zap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Large Trades',
      value: `${largeTradeCount} (>$10k)`,
      icon: TrendingUp,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index}
            className={`${card.bgColor} rounded-lg p-3 border border-gray-700`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className={`text-lg font-bold ${card.color}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}