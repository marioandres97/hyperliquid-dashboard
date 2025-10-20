'use client';

import { motion } from 'framer-motion';
import type { BuySellPressure } from '@/types/large-orders';

interface PressureGaugeProps {
  pressure: BuySellPressure;
}

export function PressureGauge({ pressure }: PressureGaugeProps) {
  // Calculate angle for gauge (-90 to 90 degrees)
  // Ratio > 2 = 90deg (max bullish)
  // Ratio = 1 = 0deg (neutral)
  // Ratio < 0.5 = -90deg (max bearish)
  const calculateAngle = (ratio: number): number => {
    if (ratio >= 2) return 90;
    if (ratio <= 0.5) return -90;
    if (ratio > 1) {
      return ((ratio - 1) / 1) * 90;
    } else {
      return ((ratio - 1) / 0.5) * 90;
    }
  };

  const angle = calculateAngle(pressure.ratio);
  const getTrendColor = () => {
    switch (pressure.trend) {
      case 'bullish':
        return { primary: '#10B981', secondary: '#059669', label: 'Bullish' };
      case 'bearish':
        return { primary: '#EF4444', secondary: '#DC2626', label: 'Bearish' };
      default:
        return { primary: '#6B7280', secondary: '#4B5563', label: 'Neutral' };
    }
  };

  const trendColor = getTrendColor();
  const totalVolume = pressure.buyVolume + pressure.sellVolume;
  const buyPercent = totalVolume > 0 ? (pressure.buyVolume / totalVolume) * 100 : 0;
  const sellPercent = totalVolume > 0 ? (pressure.sellVolume / totalVolume) * 100 : 100;

  return (
    <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 text-center">Buy/Sell Pressure</h3>
      
      {/* Gauge Container */}
      <div className="relative w-full aspect-square max-w-[200px] mx-auto mb-4">
        {/* Gauge Background Arc */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#6B7280" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            strokeDasharray="126 126"
            strokeDashoffset="63"
          />
          
          {/* Active Arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeDasharray="126 126"
            strokeDashoffset="63"
            strokeLinecap="round"
          />
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ rotate: 0 }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <div className="w-1 h-16 bg-white rounded-full shadow-lg" style={{ transformOrigin: 'center bottom' }} />
        </motion.div>

        {/* Center Circle */}
        <div 
          className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"
          style={{ backgroundColor: trendColor.primary }}
        />
      </div>

      {/* Ratio Display */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold font-mono" style={{ color: trendColor.primary }}>
          {pressure.ratio.toFixed(2)}
        </div>
        <div className="text-xs text-gray-400 mt-1">{trendColor.label}</div>
      </div>

      {/* Volume Breakdown */}
      <div className="space-y-2">
        {/* Buy Volume Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-green-400 font-semibold">Buy Volume</span>
            <span className="text-gray-400 font-mono">{buyPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${buyPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Sell Volume Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-red-400 font-semibold">Sell Volume</span>
            <span className="text-gray-400 font-mono">{sellPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-400"
              initial={{ width: 0 }}
              animate={{ width: `${sellPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
