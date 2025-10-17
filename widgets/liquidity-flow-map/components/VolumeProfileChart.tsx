'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import type { VolumeProfileMarkers, VolumeProfile } from '../types';

export interface VolumeProfileChartProps {
  volumeProfile: VolumeProfileMarkers;
  currentPrice?: number;
  height?: number;
  showMarkers?: boolean;
  showDelta?: boolean;
}

export function VolumeProfileChart({
  volumeProfile,
  currentPrice,
  height = 400,
  showMarkers = true,
  showDelta = true,
}: VolumeProfileChartProps) {
  // Prepare chart data
  const chartData = [...volumeProfile.profiles]
    .sort((a, b) => a.priceLevel - b.priceLevel)
    .map(profile => ({
      price: profile.priceLevel,
      volume: profile.volume,
      buyVolume: profile.buyVolume,
      sellVolume: profile.sellVolume,
      delta: profile.deltaVolume,
      isPOC: Math.abs(profile.priceLevel - volumeProfile.poc) < 0.01,
      isValueArea: profile.priceLevel >= volumeProfile.val && profile.priceLevel <= volumeProfile.vah,
    }));

  const maxVolume = Math.max(...chartData.map(d => d.volume));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    
    return (
      <div className="glass rounded-lg p-3 border border-white/20">
        <p className="text-white font-semibold mb-2">
          ${data.price.toFixed(2)}
        </p>
        <div className="space-y-1 text-xs">
          <p className="text-green-400">
            Buy: {data.buyVolume.toFixed(0)}
          </p>
          <p className="text-red-400">
            Sell: {data.sellVolume.toFixed(0)}
          </p>
          <p className="text-white">
            Total: {data.volume.toFixed(0)}
          </p>
          {showDelta && (
            <p className={data.delta >= 0 ? 'text-green-400' : 'text-red-400'}>
              Delta: {data.delta >= 0 ? '+' : ''}{data.delta.toFixed(0)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📊</span>
          <span>Volume Profile</span>
        </h3>
        {showMarkers && (
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-white/60">POC</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500/30"></div>
              <span className="text-white/60">Value Area</span>
            </div>
          </div>
        )}
      </div>

      {/* Volume Profile Markers */}
      {showMarkers && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-xs text-white/60">VAH</p>
            <p className="text-white font-semibold">${volumeProfile.vah.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2">
            <p className="text-xs text-yellow-400">POC</p>
            <p className="text-white font-semibold">${volumeProfile.poc.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-xs text-white/60">VAL</p>
            <p className="text-white font-semibold">${volumeProfile.val.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Volume Distribution */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis type="number" stroke="#ffffff60" />
          <YAxis 
            type="category" 
            dataKey="price" 
            stroke="#ffffff60"
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* POC Line */}
          {showMarkers && (
            <ReferenceLine 
              y={volumeProfile.poc} 
              stroke="#eab308" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'POC', fill: '#eab308', position: 'right' }}
            />
          )}
          
          {/* VAH Line */}
          {showMarkers && (
            <ReferenceLine 
              y={volumeProfile.vah} 
              stroke="#3b82f6" 
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          
          {/* VAL Line */}
          {showMarkers && (
            <ReferenceLine 
              y={volumeProfile.val} 
              stroke="#3b82f6" 
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          
          {/* Current Price Line */}
          {currentPrice && (
            <ReferenceLine 
              y={currentPrice} 
              stroke="#10b981" 
              strokeWidth={2}
              label={{ value: 'Current', fill: '#10b981', position: 'right' }}
            />
          )}

          <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => {
              let fillColor = '#3b82f680'; // Default blue
              
              if (entry.isPOC) {
                fillColor = '#eab308'; // Yellow for POC
              } else if (entry.isValueArea) {
                fillColor = '#3b82f6'; // Blue for value area
              } else {
                fillColor = '#ffffff20'; // Light for outside value area
              }
              
              return <Cell key={`cell-${index}`} fill={fillColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xs text-white/60">Total Volume</p>
          <p className="text-white font-semibold">{volumeProfile.totalVolume.toFixed(0)}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <p className="text-xs text-white/60">Value Area (70%)</p>
          <p className="text-white font-semibold">{volumeProfile.valueAreaVolume.toFixed(0)}</p>
        </div>
      </div>

      {currentPrice && (
        <div className="mt-3 p-2 rounded-lg bg-white/5 text-center">
          <p className="text-xs text-white/60 mb-1">Current Position</p>
          <p className="text-sm font-semibold">
            {currentPrice < volumeProfile.val && (
              <span className="text-blue-400">Below Value Area ↓</span>
            )}
            {currentPrice >= volumeProfile.val && currentPrice <= volumeProfile.vah && (
              <span className="text-green-400">In Value Area ✓</span>
            )}
            {currentPrice > volumeProfile.vah && (
              <span className="text-orange-400">Above Value Area ↑</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
