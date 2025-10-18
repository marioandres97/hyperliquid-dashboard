'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map/hooks';
import {
  ControlPanel,
  FlowMetricsPanel,
} from '@/widgets/liquidity-flow-map/components';
import { TradingChart } from '@/widgets/liquidity-flow-map/components/premium';
import type { Coin, TimeWindow } from '@/widgets/liquidity-flow-map/types';
import { premiumTheme } from '@/lib/theme/premium-colors';

const LiquidityFlowMapPage = () => {
  const [coin, setCoin] = useState<Coin>('BTC');
  const [timeWindow] = useState<TimeWindow>('5m'); // Fixed timeframe - showing all real-time data
  const [usePremium] = useState(true); // Enable premium by default

  const {
    flowData,
    metrics,
    isCollecting,
    lastUpdate,
    refresh,
  } = useLiquidityFlowData({
    coin,
    timeWindow,
    updateInterval: 100, // Update every 100ms for real-time feel
  });

  // Get nodes from flowData
  const nodes = flowData?.nodes || new Map();
  const trades = flowData?.trades || [];

  // Get current price from the most recent trade (approximation)
  const currentPrice = metrics?.mostActivePrice || undefined;

  // Calculate price change percentage (placeholder - would need historical data)
  const priceChange = 0; // TODO: Calculate from historical data

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: premiumTheme.background.primary }}>
      <div className="max-w-[2000px] mx-auto">
        {/* Header with Real-time Price Display */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Large Price Display */}
          <div className="flex items-baseline gap-4 mb-2">
            <div className="text-5xl md:text-6xl font-bold font-mono" style={{ color: premiumTheme.accent.gold }}>
              {coin}-USD ${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '---'}
            </div>
            {currentPrice && (
              <div className="flex items-center gap-2">
                <span className={`text-xl font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-500">LIVE</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Control Panel with Coin Selector */}
          <ControlPanel
            coin={coin}
            isCollecting={isCollecting}
            onCoinChange={setCoin}
            onRefresh={refresh}
          />
        </motion.div>

        {/* Trade Distribution Panel */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <FlowMetricsPanel 
            metrics={metrics}
            lastUpdate={lastUpdate || undefined}
          />
        </motion.div>

        {/* Main Chart: Candlestick + Heatmap + Bubbles */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TradingChart
            nodes={nodes}
            currentPrice={currentPrice}
            trades={trades}
            coin={coin}
            height={700}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LiquidityFlowMapPage;