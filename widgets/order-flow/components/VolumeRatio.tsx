'use client';

import { OrderFlowMetrics } from '../types';

interface VolumeRatioProps {
  metrics: OrderFlowMetrics;
}

export default function VolumeRatio({ metrics }: VolumeRatioProps) {
  const { buyRatio, buyVolume, sellVolume } = metrics;
  const sellRatio = 100 - buyRatio;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-green-400 font-medium">
          Buy {buyRatio.toFixed(1)}%
        </span>
        <span className="text-red-400 font-medium">
          Sell {sellRatio.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-8 bg-gray-800 rounded-lg overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-green-500/30 border-r-2 border-green-500"
          style={{ width: `${buyRatio}%` }}
        />
        <div 
          className="absolute right-0 top-0 h-full bg-red-500/30 border-l-2 border-red-500"
          style={{ width: `${sellRatio}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>{buyVolume.toFixed(2)} vol</span>
        <span>{sellVolume.toFixed(2)} vol</span>
      </div>
    </div>
  );
}