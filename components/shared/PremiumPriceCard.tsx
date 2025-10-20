'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';

interface PriceData {
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdate: number;
}

interface PremiumPriceCardProps {
  coin: string;
  data: PriceData | undefined;
  isConnected: boolean;
  sparklineData?: number[];
  instanceId?: string;
}

export function PremiumPriceCard({ 
  coin, 
  data, 
  isConnected, 
  sparklineData = [],
  instanceId = 'default'
}: PremiumPriceCardProps) {
  const isPositive = data ? data.change24h >= 0 : true;

  // Generate sparkline path - now with sparklineData in dependencies
  const sparklinePath = useMemo(() => {
    if (sparklineData.length < 2) return '';

    const width = 100;
    const height = 30;
    const padding = 2;

    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [sparklineData]);

  // Generate unique gradient ID to avoid conflicts
  const gradientId = useMemo(() => `gradient-${coin}-${instanceId}`, [coin, instanceId]);

  const getCoinName = (coin: string) => {
    const names: Record<string, string> = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      HYPE: 'Hyperliquid',
    };
    return names[coin] || coin;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-full min-h-[320px] min-w-[280px] rounded-2xl overflow-hidden group"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl" />
      
      {/* Subtle gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-50" />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-900/70" />

      {/* Glow effect */}
      <div className={`absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${
        isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
      }`} />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {coin}
              </h3>
              {/* Live indicator with pulse */}
              {isConnected && (
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 font-medium tracking-wide">
              {getCoinName(coin)}
            </p>
          </div>
        </div>

        {/* Price */}
        {data ? (
          <>
            <div className="mb-4">
              {/* Monospace font for price - PREVENTS TRUNCATION */}
              <motion.div
                key={data.price}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}
                className="text-3xl md:text-4xl font-bold font-mono text-white mb-3 tracking-tight leading-none whitespace-nowrap overflow-visible"
                style={{ 
                  fontFeatureSettings: '"tnum"',
                  minWidth: 'fit-content'
                }}
              >
                ${data.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </motion.div>

              {/* 24h Change */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                  isPositive 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
                  </span>
                </div>
                <span className="text-sm text-gray-500 font-medium">24h</span>
              </div>
            </div>

            {/* Sparkline */}
            {sparklineData.length > 1 && (
              <div className="mt-auto">
                <svg
                  viewBox="0 0 100 30"
                  className="w-full h-12"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under the line */}
                  <path
                    d={`${sparklinePath} L 100,30 L 0,30 Z`}
                    fill={`url(#${gradientId})`}
                  />
                  
                  {/* The line itself */}
                  <path
                    d={sparklinePath}
                    fill="none"
                    stroke={isPositive ? '#22c55e' : '#ef4444'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                  />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {isConnected ? (
              <div className="text-gray-400 text-lg font-medium">Loading...</div>
            ) : (
              <div className="text-center">
                <div className="text-gray-400 mb-2 text-lg font-medium">Reconnecting...</div>
                <div className="text-sm text-gray-500">Please wait...</div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
