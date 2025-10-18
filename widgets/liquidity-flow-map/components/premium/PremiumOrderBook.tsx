'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { itemVariants } from '@/lib/effects/premium-effects';
import type { LiquidityNode } from '../../types';

export interface PremiumOrderBookProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
  depth?: number;
}

export function PremiumOrderBook({ nodes, currentPrice, depth = 10 }: PremiumOrderBookProps) {
  const { asks, bids, spread, spreadPercent } = useMemo(() => {
    const sortedNodes = Array.from(nodes.values()).sort((a, b) => b.price - a.price);
    
    // Use provided currentPrice, or calculate mid-price from nodes
    let currentPriceValue = currentPrice;
    if (!currentPriceValue && sortedNodes.length > 0) {
      // Calculate mid-price from available nodes
      const allPrices = sortedNodes.map(n => n.price);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      currentPriceValue = (minPrice + maxPrice) / 2;
    }
    currentPriceValue = currentPriceValue || 0;
    
    const asks = sortedNodes
      .filter(n => n.price > currentPriceValue && n.sellVolume > 0)
      .slice(0, depth)
      .reverse();
    
    const bids = sortedNodes
      .filter(n => n.price <= currentPriceValue && n.buyVolume > 0)
      .slice(0, depth);
    
    const lowestAsk = asks[0]?.price || 0;
    const highestBid = bids[0]?.price || 0;
    const spread = lowestAsk - highestBid;
    const spreadPercent = highestBid > 0 ? (spread / highestBid) * 100 : 0;
    
    return { asks, bids, spread, spreadPercent };
  }, [nodes, currentPrice, depth]);

  const maxVolume = useMemo(() => {
    const allVolumes = [
      ...asks.map(a => a.sellVolume),
      ...bids.map(b => b.buyVolume),
    ];
    return Math.max(...allVolumes, 1);
  }, [asks, bids]);

  const formatPrice = (price: number) => {
    if (!isFinite(price) || isNaN(price)) {
      return '0.00';
    }
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  return (
    <motion.div
      className="premium-glass rounded-xl p-6"
      variants={itemVariants}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: premiumTheme.accent.gold }}>
        Order Book
      </h3>

      {/* Header */}
      <div className="grid grid-cols-3 gap-4 mb-2 text-xs font-semibold pb-2 border-b" 
        style={{ color: premiumTheme.accent.platinum + '99', borderColor: premiumTheme.borders.subtle }}>
        <div className="text-right">Price</div>
        <div className="text-right">Volume</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="space-y-1 mb-4">
        {asks.map((ask, index) => {
          const percentage = (ask.sellVolume / maxVolume) * 100;
          const cumulative = asks.slice(0, index + 1).reduce((sum, a) => sum + a.sellVolume, 0);
          
          return (
            <div key={ask.price} className="relative group">
              {/* Background bar */}
              <div
                className="absolute right-0 top-0 bottom-0 rounded transition-all"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: premiumTheme.trading.sell.base + '22',
                }}
              />
              
              {/* Content */}
              <div className="relative grid grid-cols-3 gap-4 py-1.5 text-sm font-mono">
                <div className="text-right font-semibold" style={{ color: premiumTheme.trading.sell.base }}>
                  ${formatPrice(ask.price)}
                </div>
                <div className="text-right" style={{ color: premiumTheme.accent.platinum }}>
                  {formatVolume(ask.sellVolume)}
                </div>
                <div className="text-right text-xs" style={{ color: premiumTheme.accent.platinum + '66' }}>
                  {formatVolume(cumulative)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      <div className="py-3 mb-4 rounded-lg text-center" 
        style={{ backgroundColor: premiumTheme.background.tertiary }}>
        <div className="text-xs mb-1" style={{ color: premiumTheme.accent.platinum + '66' }}>
          Spread
        </div>
        <div className="font-mono font-bold" style={{ color: premiumTheme.accent.gold }}>
          ${formatPrice(spread)} ({spreadPercent.toFixed(2)}%)
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="space-y-1">
        {bids.map((bid, index) => {
          const percentage = (bid.buyVolume / maxVolume) * 100;
          const cumulative = bids.slice(0, index + 1).reduce((sum, b) => sum + b.buyVolume, 0);
          
          return (
            <div key={bid.price} className="relative group">
              {/* Background bar */}
              <div
                className="absolute right-0 top-0 bottom-0 rounded transition-all"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: premiumTheme.trading.buy.base + '22',
                }}
              />
              
              {/* Content */}
              <div className="relative grid grid-cols-3 gap-4 py-1.5 text-sm font-mono">
                <div className="text-right font-semibold" style={{ color: premiumTheme.trading.buy.base }}>
                  ${formatPrice(bid.price)}
                </div>
                <div className="text-right" style={{ color: premiumTheme.accent.platinum }}>
                  {formatVolume(bid.buyVolume)}
                </div>
                <div className="text-right text-xs" style={{ color: premiumTheme.accent.platinum + '66' }}>
                  {formatVolume(cumulative)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      {currentPrice && (
        <div className="mt-4 pt-4 border-t text-center text-xs" 
          style={{ borderColor: premiumTheme.borders.subtle, color: premiumTheme.accent.platinum + '66' }}>
          Current Price: <span className="font-mono font-bold" style={{ color: premiumTheme.accent.gold }}>
            ${formatPrice(currentPrice)}
          </span>
        </div>
      )}
    </motion.div>
  );
}
