'use client';

import React from 'react';
import type { FlowMetrics } from '../types';

export interface FlowMetricsPanelProps {
  metrics: FlowMetrics | null;
  lastUpdate?: Date;
}

export function FlowMetricsPanel({ 
  metrics, 
  lastUpdate,
}: FlowMetricsPanelProps) {
  if (!metrics) {
    return (
      <div className="glass rounded-xl p-6">
        <p className="text-white/60 text-center">No hay datos disponibles</p>
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

  const metrics_data = [
    {
      label: 'Dirección',
      value: metrics.flowDirection === 'inflow' ? 'ENTRADA' : metrics.flowDirection === 'outflow' ? 'SALIDA' : 'NEUTRAL',
      color: getFlowDirectionColor(metrics.flowDirection),
      icon: '📊',
    },
    {
      label: 'Flujo Neto',
      value: `$${formatNumber(metrics.netFlow)}`,
      color: metrics.netFlow >= 0 ? 'text-green-400' : 'text-red-400',
      icon: '💰',
    },
    {
      label: 'Total Operaciones',
      value: metrics.totalTrades.toLocaleString(),
      color: 'text-blue-400',
      icon: '📈',
    },
    {
      label: 'Ballenas',
      value: metrics.whaleTradeCount.toLocaleString(),
      color: 'text-purple-400',
      icon: '🐋',
    },
    {
      label: 'Desequilibrio',
      value: `${(metrics.volumeImbalance * 100).toFixed(1)}%`,
      color: metrics.volumeImbalance > 0 ? 'text-green-400' : 'text-red-400',
      icon: '⚖️',
    },
    {
      label: 'Liquidaciones',
      value: `$${formatNumber(metrics.totalLiquidationVolume)}`,
      color: 'text-orange-400',
      icon: '⚡',
    },
  ];

  return (
    <div className="glass rounded-xl p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-white">Métricas de Flujo</h3>
        {lastUpdate && (
          <span className="text-xs text-white/60">
            {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics_data.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{item.icon}</span>
              <div className="text-xs text-white/60">{item.label}</div>
            </div>
            <div className={`text-lg md:text-xl font-bold ${item.color}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
