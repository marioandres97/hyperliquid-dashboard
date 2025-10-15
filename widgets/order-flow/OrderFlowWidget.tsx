'use client';

import { useState } from 'react';
import { useOrderFlowData } from './useOrderFlowData';
import { Coin, Timeframe } from './types';
import CVDChart from './components/CVDChart';
import VolumeRatio from './components/VolumeRatio';
import MetricsCards from './components/MetricsCards';

export default function OrderFlowWidget() {
  const [coin, setCoin] = useState<Coin>('BTC');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');

  const { metrics, deltaTimeline, isLoading, lastUpdate } = useOrderFlowData(coin, timeframe);

  const coins: Coin[] = ['BTC', 'ETH', 'HYPE'];
  const timeframes: Timeframe[] = ['5m', '15m', '1h', '4h'];

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading order flow data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {coins.map((c) => (
            <button
              key={c}
              onClick={() => setCoin(c)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                coin === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Volume Ratio Bar */}
      <VolumeRatio metrics={metrics} />

      {/* CVD Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Cumulative Volume Delta (CVD)
        </h3>
        <CVDChart data={deltaTimeline} />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>⚠️ Simulated data - WebSocket integration pending</span>
        {lastUpdate && (
          <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}