'use client';

import React from 'react';
import type { FlowMetrics, DetectedPattern } from '../types';

export interface FlowMetricsPanelProps {
  metrics: FlowMetrics | null;
  lastUpdate?: Date;
  patterns?: DetectedPattern[];
  showPatterns?: boolean;
}

export function FlowMetricsPanel({ 
  metrics, 
  lastUpdate,
  patterns = [],
  showPatterns = true,
}: FlowMetricsPanelProps) {
  if (!metrics) {
    return (
      <div className="glass rounded-xl p-6">
        <p className="text-white/60 text-center">No data available</p>
      </div>
    );
  }

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(decimals)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(decimals)}K`;
    }
    return num.toFixed(decimals);
  };

  const getFlowDirectionColor = (direction: string) => {
    switch (direction) {
      case 'inflow':
        return 'text-green-400';
      case 'outflow':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  // Get top patterns by confidence
  const topPatterns = showPatterns && patterns.length > 0
    ? patterns
        .sort((a, b) => (b.confidence * b.strength) - (a.confidence * a.strength))
        .slice(0, 3)
    : [];

  const metrics_data = [
    {
      label: 'Flow Direction',
      value: metrics.flowDirection.toUpperCase(),
      color: getFlowDirectionColor(metrics.flowDirection),
      icon: '📊',
    },
    {
      label: 'Net Flow',
      value: `$${formatNumber(metrics.netFlow)}`,
      color: metrics.netFlow >= 0 ? 'text-green-400' : 'text-red-400',
      icon: '💰',
    },
    {
      label: 'Total Trades',
      value: metrics.totalTrades.toLocaleString(),
      color: 'text-blue-400',
      icon: '📈',
    },
    {
      label: 'Whale Trades',
      value: metrics.whaleTradeCount.toLocaleString(),
      color: 'text-purple-400',
      icon: '🐋',
    },
    {
      label: 'Buy Volume',
      value: `$${formatNumber(metrics.totalBuyVolume)}`,
      color: 'text-green-400',
      icon: '⬆️',
    },
    {
      label: 'Sell Volume',
      value: `$${formatNumber(metrics.totalSellVolume)}`,
      color: 'text-red-400',
      icon: '⬇️',
    },
    {
      label: 'Volume Imbalance',
      value: `${(metrics.volumeImbalance * 100).toFixed(1)}%`,
      color: metrics.volumeImbalance > 0 ? 'text-green-400' : 'text-red-400',
      icon: '⚖️',
    },
    {
      label: 'Liquidations',
      value: metrics.totalLiquidations.toLocaleString(),
      color: 'text-orange-400',
      icon: '⚡',
    },
    {
      label: 'Whale Net Flow',
      value: `$${formatNumber(metrics.whaleNetFlow)}`,
      color: metrics.whaleNetFlow >= 0 ? 'text-green-400' : 'text-red-400',
      icon: '📊',
    },
    {
      label: 'Most Active',
      value: metrics.mostActivePrice ? `$${formatNumber(metrics.mostActivePrice, 2)}` : 'N/A',
      color: 'text-cyan-400',
      icon: '💹',
    },
    {
      label: 'Whale Volume',
      value: `$${formatNumber(metrics.whaleBuyVolume + metrics.whaleSellVolume)}`,
      color: 'text-purple-400',
      icon: '🐳',
    },
    {
      label: 'Liq. Volume',
      value: `$${formatNumber(metrics.totalLiquidationVolume)}`,
      color: 'text-orange-400',
      icon: '💥',
    },
  ];

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Flow Metrics</h3>
        {lastUpdate && (
          <span className="text-xs text-white/60">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics_data.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-xs text-white/60">{item.label}</div>
            </div>
            <div className={`text-xl font-bold ${item.color}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pattern Insights Section */}
      {showPatterns && topPatterns.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>🔍</span>
            <span>Active Patterns</span>
          </h4>
          <div className="space-y-2">
            {topPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-white/90 font-medium">
                      {pattern.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/50">
                        Confidence: {(pattern.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-white/50">
                        Strength: {pattern.strength.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                      <span className="text-lg font-bold text-purple-300">
                        {(pattern.confidence * pattern.strength).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
