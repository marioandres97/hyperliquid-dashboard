'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useOIPriceData } from './usePriceFundingData';
import { Coin, Timeframe } from './types';
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock } from 'lucide-react';

export default function OIPriceWidget() {
  const [selectedCoin, setSelectedCoin] = useState<Coin>('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1d');

  const { data, correlation, loading, error, lastUpdate, volume24h, fundingRate } = useOIPriceData(selectedCoin, selectedTimeframe);

  const coins: Coin[] = ['BTC', 'ETH', 'HYPE'];
  const timeframes: Timeframe[] = ['1h', '4h', '1d', '7d'];

  const chartData = data.map(d => {
  const date = new Date(d.timestamp);
  const timeFormat = selectedTimeframe === '7d' 
    ? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return {
    time: timeFormat,
    Price: d.price.toFixed(2),
    'Funding Rate': (d.fundingRate * 100).toFixed(4),
  };
});

  const correlationColor = correlation && correlation > 0 ? 'text-green-400' : 'text-red-400';
  const correlationIcon = correlation && correlation > 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />;

  return (
    <div className="space-y-4">
      {/* Selectores */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Coin</label>
          <div className="flex gap-2">
            {coins.map(coin => (
              <button
                key={coin}
                onClick={() => setSelectedCoin(coin)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCoin === coin
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Timeframe</label>
          <div className="flex gap-2">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedTimeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Correlación */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {correlationIcon}
              <p className="text-sm text-slate-400">Correlation</p>
            </div>
            <p className={`text-2xl font-bold ${correlationColor}`}>
              {correlation?.toFixed(4) || 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {correlation && Math.abs(correlation) > 0.7 ? 'Strong' : correlation && Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'}
            </p>
          </div>

          {/* Volumen 24h */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <p className="text-sm text-slate-400">Volume 24h</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              ${(volume24h / 1000000).toFixed(2)}M
            </p>
            <p className="text-xs text-slate-500 mt-1">USDC</p>
          </div>

          {/* Funding Rate Actual */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6 text-purple-400" />
              <p className="text-sm text-slate-400">Current Funding</p>
            </div>
            <p className={`text-2xl font-bold ${fundingRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fundingRate.toFixed(4)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">8h rate</p>
          </div>

          {/* Last Update */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-amber-400" />
              <p className="text-sm text-slate-400">Last Update</p>
            </div>
            <p className="text-lg font-bold text-amber-400">
              {lastUpdate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Auto: 30s</p>
          </div>
        </div>
      )}

      {/* Loading/Error */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <p className="text-red-400">⚠️ Error: {error}</p>
        </div>
      )}

      {/* Gráfica */}
      {!loading && !error && data.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Price vs Funding Rate</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
  dataKey="time" 
  stroke="#94a3b8" 
  style={{ fontSize: '10px' }}
  interval="preserveStartEnd"
  minTickGap={selectedTimeframe === '7d' ? 30 : 50}
  angle={selectedTimeframe === '7d' ? -45 : 0}
  textAnchor={selectedTimeframe === '7d' ? 'end' : 'middle'}
  height={selectedTimeframe === '7d' ? 80 : 60}
/>
              <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#a855f7" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Price (USD)" />
              <Line yAxisId="right" type="monotone" dataKey="Funding Rate" stroke="#a855f7" strokeWidth={2} dot={false} name="Funding Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
        <p className="text-xs text-amber-300">
          ⚠️ Note: Historical funding rate data is approximated based on price movements. Current funding rate is real-time from Hyperliquid API.
        </p>
      </div>
    </div>
  );
}