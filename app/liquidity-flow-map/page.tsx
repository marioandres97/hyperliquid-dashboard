'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map/hooks';
import {
  ControlPanel,
  FlowMetricsPanel,
  LiquidityLevelIndicator,
  TimeSeriesChart,
  LiquidityHeatmap,
} from '@/widgets/liquidity-flow-map/components';
import { PremiumMetricsCard } from '@/widgets/liquidity-flow-map/components/premium';
import type { Coin, TimeWindow } from '@/widgets/liquidity-flow-map/types';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { containerVariants } from '@/lib/effects/premium-effects';

const LiquidityFlowMapPage = () => {
  const [coin, setCoin] = useState<Coin>('BTC');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('5m');
  const [usePremium] = useState(true); // Enable premium by default

  const {
    flowData,
    metrics,
    timeSeries,
    isCollecting,
    lastUpdate,
    refresh,
  } = useLiquidityFlowData({
    coin,
    timeWindow,
    updateInterval: 2000, // Update every 2 seconds
  });

  // Get nodes from flowData
  const nodes = flowData?.nodes || new Map();

  // Get current price from the most recent trade (approximation)
  const currentPrice = metrics?.mostActivePrice || undefined;

  // Format volume helper
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: premiumTheme.background.primary }}>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: premiumTheme.accent.gold }}
          >
            Premium Liquidity Flow Map
          </h1>
          <p style={{ color: premiumTheme.accent.platinum + '99' }}>
            Real-time visualization of liquidity flows powered by Hyperliquid DEX
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ControlPanel
            coin={coin}
            timeWindow={timeWindow}
            isCollecting={isCollecting}
            onCoinChange={setCoin}
            onTimeWindowChange={setTimeWindow}
            onRefresh={refresh}
          />
        </motion.div>

        {/* Premium Metrics Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <PremiumMetricsCard
            title="Total Volume"
            value={formatVolume((metrics?.totalBuyVolume || 0) + (metrics?.totalSellVolume || 0))}
            color="gold"
            icon={<span className="text-2xl">📊</span>}
          />
          <PremiumMetricsCard
            title="Buy Volume"
            value={formatVolume(metrics?.totalBuyVolume || 0)}
            color="buy"
            trend={metrics?.volumeImbalance && metrics.volumeImbalance > 0 ? 'up' : metrics?.volumeImbalance && metrics.volumeImbalance < 0 ? 'down' : 'neutral'}
            icon={<span className="text-2xl">↗</span>}
          />
          <PremiumMetricsCard
            title="Sell Volume"
            value={formatVolume(metrics?.totalSellVolume || 0)}
            color="sell"
            trend={metrics?.volumeImbalance && metrics.volumeImbalance < 0 ? 'up' : metrics?.volumeImbalance && metrics.volumeImbalance > 0 ? 'down' : 'neutral'}
            icon={<span className="text-2xl">↘</span>}
          />
          <PremiumMetricsCard
            title="Active Levels"
            value={nodes.size}
            color="neutral"
            subtitle="Price levels"
            icon={<span className="text-2xl">🎯</span>}
          />
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Left Column - Metrics and Levels */}
          <div className="lg:col-span-1 space-y-6">
            <FlowMetricsPanel metrics={metrics} lastUpdate={lastUpdate || undefined} />
            <LiquidityLevelIndicator metrics={metrics} />
          </div>

          {/* Right Column - Premium Heatmap */}
          <div className="lg:col-span-2">
            <LiquidityHeatmap 
              nodes={nodes} 
              currentPrice={currentPrice}
              usePremium={usePremium}
            />
          </div>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TimeSeriesChart timeSeries={timeSeries} />
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          className="premium-glass rounded-xl p-4 text-center text-sm"
          style={{ color: premiumTheme.accent.platinum + '99' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>
            Premium Liquidity Flow Map • Real-time data from Hyperliquid DEX WebSocket
          </p>
          <p className="text-xs mt-2" style={{ color: premiumTheme.accent.gold + '66' }}>
            Canvas-powered visualization • 60 FPS smooth rendering
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LiquidityFlowMapPage;