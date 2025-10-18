'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { itemVariants } from '@/lib/effects/premium-effects';

export interface PremiumMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'buy' | 'sell' | 'neutral' | 'gold';
}

export function PremiumMetricsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'neutral',
}: PremiumMetricsCardProps) {
  const getColor = () => {
    switch (color) {
      case 'buy':
        return premiumTheme.trading.buy.base;
      case 'sell':
        return premiumTheme.trading.sell.base;
      case 'gold':
        return premiumTheme.accent.gold;
      default:
        return premiumTheme.accent.platinum;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <motion.div
      className="premium-glass rounded-xl p-4 hover:scale-105 transition-transform"
      variants={itemVariants}
      style={{
        border: `1px solid ${premiumTheme.borders.medium}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm" style={{ color: premiumTheme.accent.platinum + '99' }}>
          {title}
        </div>
        {icon && (
          <div style={{ color: getColor() }}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold font-mono" style={{ color: getColor() }}>
          {value}
        </div>
        {trend && (
          <div className={`text-sm ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
            {getTrendIcon()}
          </div>
        )}
      </div>

      {subtitle && (
        <div className="text-xs mt-1" style={{ color: premiumTheme.accent.platinum + '66' }}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
