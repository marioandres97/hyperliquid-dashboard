'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map/hooks';
import {
  ControlPanel,
  LiquidityHeatmap,
} from '@/widgets/liquidity-flow-map/components';
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

  // Get current price from the most recent trade (approximation)
  const currentPrice = metrics?.mostActivePrice || undefined;

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
          <div className="text-5xl md:text-6xl font-bold font-mono mb-4" style={{ color: premiumTheme.accent.gold }}>
            {coin}-USD ${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
          </div>
          
          {/* Control Panel with Coin Selector and Live Indicator */}
          <ControlPanel
            coin={coin}
            isCollecting={isCollecting}
            onCoinChange={setCoin}
            onRefresh={refresh}
          />
        </motion.div>

        {/* Full-width Premium Heatmap */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LiquidityHeatmap 
            nodes={nodes} 
            currentPrice={currentPrice}
            usePremium={usePremium}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LiquidityFlowMapPage;