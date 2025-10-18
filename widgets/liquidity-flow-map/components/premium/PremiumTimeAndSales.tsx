'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { itemVariants } from '@/lib/effects/premium-effects';
import type { ClassifiedTrade } from '../../types';

export interface PremiumTimeAndSalesProps {
  trades: ClassifiedTrade[];
  maxTrades?: number;
}

export function PremiumTimeAndSales({ trades, maxTrades = 50 }: PremiumTimeAndSalesProps) {
  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxTrades);
  }, [trades, maxTrades]);

  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp < 0 || isNaN(timestamp)) {
      return '--:--:--';
    }
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    if (!isFinite(price) || isNaN(price)) {
      return '0.00';
    }
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatSize = (size: number) => {
    if (size >= 1000) return `${(size / 1000).toFixed(2)}K`;
    return size.toFixed(2);
  };

  if (recentTrades.length === 0) {
    return (
      <motion.div
        className="premium-glass rounded-xl p-6"
        variants={itemVariants}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: premiumTheme.accent.gold }}>
          Time & Sales
        </h3>
        <p className="text-center py-8" style={{ color: premiumTheme.accent.platinum + '66' }}>
          No trades recorded yet
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="premium-glass rounded-xl p-6"
      variants={itemVariants}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: premiumTheme.accent.gold }}>
        Time & Sales
      </h3>

      <div className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 mb-2 text-xs font-semibold pb-2 border-b" 
          style={{ color: premiumTheme.accent.platinum + '99', borderColor: premiumTheme.borders.subtle }}>
          <div>Time</div>
          <div className="text-right">Price</div>
          <div className="text-right">Size</div>
          <div className="text-center">Side</div>
        </div>

        {/* Trades */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {recentTrades.map((trade, index) => (
            <motion.div
              key={trade.hash}
              className="grid grid-cols-4 gap-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <div className="font-mono text-xs" style={{ color: premiumTheme.accent.platinum + '66' }}>
                {formatTime(trade.timestamp)}
              </div>
              <div className="text-right font-mono font-semibold" 
                style={{ color: premiumTheme.accent.platinum }}>
                ${formatPrice(trade.price)}
              </div>
              <div className="text-right font-mono" 
                style={{ color: premiumTheme.accent.platinum + '99' }}>
                {formatSize(trade.size)}
              </div>
              <div className="flex items-center justify-center gap-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: trade.side === 'buy' 
                      ? premiumTheme.trading.buy.base + '33'
                      : premiumTheme.trading.sell.base + '33',
                    color: trade.side === 'buy' 
                      ? premiumTheme.trading.buy.base
                      : premiumTheme.trading.sell.base,
                  }}
                >
                  {trade.side === 'buy' ? 'BUY' : 'SELL'}
                </span>
                {trade.classification.isWhale && (
                  <span 
                    style={{ color: premiumTheme.accent.gold }}
                    role="img"
                    aria-label="Whale trade"
                  >
                    🐋
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: premiumTheme.borders.subtle }}>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div style={{ color: premiumTheme.accent.platinum + '66' }}>Total Trades</div>
            <div className="font-bold" style={{ color: premiumTheme.accent.platinum }}>
              {recentTrades.length}
            </div>
          </div>
          <div>
            <div style={{ color: premiumTheme.accent.platinum + '66' }}>Buy Trades</div>
            <div className="font-bold" style={{ color: premiumTheme.trading.buy.base }}>
              {recentTrades.filter(t => t.side === 'buy').length}
            </div>
          </div>
          <div>
            <div style={{ color: premiumTheme.accent.platinum + '66' }}>Sell Trades</div>
            <div className="font-bold" style={{ color: premiumTheme.trading.sell.base }}>
              {recentTrades.filter(t => t.side === 'sell').length}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
