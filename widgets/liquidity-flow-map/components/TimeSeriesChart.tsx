'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { FlowTimePoint, SupportResistanceLevel } from '../types';

export interface TimeSeriesChartProps {
  timeSeries: FlowTimePoint[];
  supportResistanceLevels?: SupportResistanceLevel[];
  showSRLevels?: boolean;
}

export function TimeSeriesChart({ 
  timeSeries,
  supportResistanceLevels = [],
  showSRLevels = true,
}: TimeSeriesChartProps) {
  if (!timeSeries || timeSeries.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Flow Timeline</h3>
        <p className="text-white/60 text-center py-8">No time series data available</p>
      </div>
    );
  }

  // Format data for recharts
  const chartData = timeSeries.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: point.timestamp,
    price: point.price,
    'Net Flow': point.netFlow,
    'Buy Volume': point.buyVolume,
    'Sell Volume': -point.sellVolume, // Negative for visual distinction
    'Whale Flow': point.whaleFlow,
    'Liquidations': point.liquidationVolume,
  }));

  // Get visible S/R levels (those within the price range of time series)
  const priceRange = timeSeries.map(p => p.price);
  const minPrice = Math.min(...priceRange);
  const maxPrice = Math.max(...priceRange);
  
  const visibleSRLevels = showSRLevels 
    ? supportResistanceLevels.filter(
        l => !l.isBreached && l.price >= minPrice && l.price <= maxPrice
      )
    : [];

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Flow Timeline</h3>
        {showSRLevels && visibleSRLevels.length > 0 && (
          <div className="text-xs text-white/60">
            {visibleSRLevels.length} S/R level{visibleSRLevels.length !== 1 ? 's' : ''} visible
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.6)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#fff' }}
          />
          
          {/* S/R Level markers */}
          {visibleSRLevels.map((level) => (
            <ReferenceLine
              key={level.id}
              y={level.price}
              stroke={level.type === 'support' ? '#10b981' : '#ef4444'}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `${level.type === 'support' ? '🛡️' : '🚧'} $${level.price.toFixed(2)}`,
                position: 'right',
                fill: level.type === 'support' ? '#10b981' : '#ef4444',
                fontSize: 12,
              }}
            />
          ))}
          
          <Line 
            type="monotone" 
            dataKey="Net Flow" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Buy Volume" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Sell Volume" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Whale Flow" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="Liquidations" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Data Points</div>
          <div className="text-lg font-bold text-white">{timeSeries.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Latest Net Flow</div>
          <div className={`text-lg font-bold ${timeSeries[timeSeries.length - 1].netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(timeSeries[timeSeries.length - 1].netFlow / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Latest Whale Flow</div>
          <div className={`text-lg font-bold ${timeSeries[timeSeries.length - 1].whaleFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(timeSeries[timeSeries.length - 1].whaleFlow / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Time Range</div>
          <div className="text-lg font-bold text-white">
            {Math.round((timeSeries[timeSeries.length - 1].timestamp - timeSeries[0].timestamp) / 60000)}m
          </div>
        </div>
      </div>
    </div>
  );
}
