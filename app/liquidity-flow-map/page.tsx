'use client';

import React, { useState } from 'react';
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map/hooks';
import {
  ControlPanel,
  FlowMetricsPanel,
  LiquidityLevelIndicator,
  TimeSeriesChart,
  LiquidityHeatmap,
} from '@/widgets/liquidity-flow-map/components';
import type { Coin, TimeWindow } from '@/widgets/liquidity-flow-map/types';

const LiquidityFlowMapPage = () => {
  const [coin, setCoin] = useState<Coin>('BTC');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('5m');

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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Liquidity Flow Map</h1>
          <p className="text-white/70">
            Real-time visualization of liquidity flows and market dynamics
          </p>
        </div>

        {/* Control Panel */}
        <ControlPanel
          coin={coin}
          timeWindow={timeWindow}
          isCollecting={isCollecting}
          onCoinChange={setCoin}
          onTimeWindowChange={setTimeWindow}
          onRefresh={refresh}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Metrics and Levels */}
          <div className="lg:col-span-1 space-y-6">
            <FlowMetricsPanel metrics={metrics} lastUpdate={lastUpdate || undefined} />
            <LiquidityLevelIndicator metrics={metrics} />
          </div>

          {/* Right Column - Heatmap */}
          <div className="lg:col-span-2">
            <LiquidityHeatmap nodes={nodes} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="mb-6">
          <TimeSeriesChart timeSeries={timeSeries} />
        </div>

        {/* Footer Info */}
        <div className="glass rounded-xl p-4 text-center text-white/60 text-sm">
          <p>
            Liquidity Flow Map tracks real-time trade flows and aggregates them into price levels.
            Use zoom controls to explore the heatmap in detail.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiquidityFlowMapPage;