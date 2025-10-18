'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map/hooks';
import {
  ControlPanel,
  FlowMetricsPanel,
  LiquidityLevelIndicator,
  LiquidityHeatmap,
} from '@/widgets/liquidity-flow-map/components';
import { PremiumMetricsCard } from '@/widgets/liquidity-flow-map/components/premium';
import type { Coin, TimeWindow } from '@/widgets/liquidity-flow-map/types';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { containerVariants } from '@/lib/effects/premium-effects';

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
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: premiumTheme.background.primary }}>
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-3xl md:text-4xl font-bold mb-2" 
            style={{ color: premiumTheme.accent.gold }}
          >
            Mapa de Flujo de Liquidez Premium
          </h1>
          <p className="text-sm md:text-base" style={{ color: premiumTheme.accent.platinum + '99' }}>
            Visualización en tiempo real de flujos de liquidez desde Hyperliquid DEX
          </p>
        </motion.div>

        {/* Real-time Price Display */}
        <motion.div
          className="premium-glass rounded-xl p-6 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${isCollecting ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <div className="text-sm" style={{ color: premiumTheme.accent.platinum + '99' }}>
                  Precio Actual {coin}
                </div>
                <div className="text-4xl md:text-5xl font-bold font-mono" style={{ color: premiumTheme.accent.gold }}>
                  ${currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                </div>
              </div>
            </div>
            {lastUpdate && (
              <div className="text-xs md:text-sm text-right" style={{ color: premiumTheme.accent.platinum + '66' }}>
                <div>Última actualización</div>
                <div className="font-mono">{lastUpdate.toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ControlPanel
            coin={coin}
            isCollecting={isCollecting}
            onCoinChange={setCoin}
            onRefresh={refresh}
          />
        </motion.div>

        {/* Premium Metrics Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <PremiumMetricsCard
            title="Volumen Total"
            value={formatVolume((metrics?.totalBuyVolume || 0) + (metrics?.totalSellVolume || 0))}
            color="gold"
            icon={<span className="text-2xl">📊</span>}
          />
          <PremiumMetricsCard
            title="Volumen Compra"
            value={formatVolume(metrics?.totalBuyVolume || 0)}
            color="buy"
            trend={metrics?.volumeImbalance && metrics.volumeImbalance > 0 ? 'up' : metrics?.volumeImbalance && metrics.volumeImbalance < 0 ? 'down' : 'neutral'}
            icon={<span className="text-2xl">↗</span>}
          />
          <PremiumMetricsCard
            title="Volumen Venta"
            value={formatVolume(metrics?.totalSellVolume || 0)}
            color="sell"
            trend={metrics?.volumeImbalance && metrics.volumeImbalance < 0 ? 'up' : metrics?.volumeImbalance && metrics.volumeImbalance > 0 ? 'down' : 'neutral'}
            icon={<span className="text-2xl">↘</span>}
          />
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Left Column - Metrics and Trade Distribution */}
          <div className="xl:col-span-1 space-y-4">
            <FlowMetricsPanel metrics={metrics} lastUpdate={lastUpdate || undefined} />
            <LiquidityLevelIndicator metrics={metrics} />
          </div>

          {/* Right Column - Premium Heatmap */}
          <div className="xl:col-span-2">
            <LiquidityHeatmap 
              nodes={nodes} 
              currentPrice={currentPrice}
              usePremium={usePremium}
            />
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          className="premium-glass rounded-xl p-4 text-center text-xs md:text-sm"
          style={{ color: premiumTheme.accent.platinum + '99' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>
            Mapa de Flujo de Liquidez Premium • Datos en tiempo real desde Hyperliquid DEX WebSocket
          </p>
          <p className="text-xs mt-2" style={{ color: premiumTheme.accent.gold + '66' }}>
            Visualización optimizada con Canvas • Renderizado suave a 60 FPS
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LiquidityFlowMapPage;