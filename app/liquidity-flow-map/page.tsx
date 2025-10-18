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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isCollecting ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <div className="text-5xl md:text-6xl font-bold font-mono" style={{ color: premiumTheme.accent.gold }}>
                  {coin}-USD ${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ControlPanel
                coin={coin}
                isCollecting={isCollecting}
                onCoinChange={setCoin}
                onRefresh={refresh}
              />
            </div>
          </div>
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