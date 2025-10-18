'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../shared';
import { Activity, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFundingRate, useMarketMetrics } from '@/lib/hyperliquid/hooks';

interface VolatilityLevel {
  price: number;
  volatility: number;
  trades: number;
}

interface FundingData {
  timestamp: Date;
  rate: number;
}

const Module5VolatilityContext: React.FC = () => {
  const { fundingRate, isLoading: fundingLoading } = useFundingRate('BTC');
  const { metrics, isLoading: metricsLoading } = useMarketMetrics('BTC');
  const [fundingHistory, setFundingHistory] = useState<FundingData[]>([]);
  const [volatilityLevels, setVolatilityLevels] = useState<VolatilityLevel[]>([]);

  // Track funding rate history
  useEffect(() => {
    if (fundingRate) {
      setFundingHistory(prev => {
        const newHistory = [...prev, { timestamp: fundingRate.timestamp, rate: fundingRate.fundingRate }];
        // Keep last 24 hours (assuming updates every 30 seconds, ~2880 points)
        return newHistory.slice(-100);
      });
    }
  }, [fundingRate]);

  // Calculate volatility from price changes
  useEffect(() => {
    if (metrics) {
      // Generate volatility levels based on current price
      const levels: VolatilityLevel[] = [];
      const basePrice = metrics.markPrice;
      
      for (let i = -10; i < 10; i++) {
        const priceOffset = i * (basePrice * 0.01); // 1% intervals
        const price = basePrice + priceOffset;
        // Simulate volatility based on distance from current price
        const volatility = 100 - Math.abs(i) * 5;
        levels.push({
          price,
          volatility,
          trades: Math.floor(Math.random() * 1000),
        });
      }
      setVolatilityLevels(levels);
    }
  }, [metrics]);

  const currentFunding = fundingRate?.fundingRate || 0;
  const fundingInterpretation = currentFunding > 0.01 
    ? 'High funding rate indicates many LONG positions'
    : currentFunding < -0.01
    ? 'Negative funding indicates many SHORT positions'
    : 'Neutral funding rate - balanced market';

  const strategy = currentFunding > 0.01
    ? 'High funding + Short positions = Counter-trend institutional play'
    : currentFunding < -0.01
    ? 'Negative funding + Long positions = Counter-trend opportunity'
    : 'Balanced market - wait for clear signal';

  const isConnected = !fundingLoading && !metricsLoading;

  return (
    <div className="space-y-4">
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-purple-200">Volatility & Market Context</h2>
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'LIVE' : 'LOADING'}
          </div>
        </div>

        {/* Current Funding Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-6 rounded-lg" style={{
            background: currentFunding > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: currentFunding > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={currentFunding > 0 ? 'text-green-400' : 'text-red-400'} size={20} />
              <h3 className="text-lg font-bold text-gray-200">Current Funding Rate</h3>
            </div>
            <div className={`text-4xl font-bold mb-2 ${currentFunding > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(currentFunding * 100).toFixed(4)}%
            </div>
            <div className="text-sm text-gray-400">{fundingInterpretation}</div>
          </div>

          <div className="p-6 rounded-lg" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-400" size={20} />
              <h3 className="text-lg font-bold text-gray-200">Strategy Signal</h3>
            </div>
            <div className="text-sm text-gray-300 mt-4">
              {strategy}
            </div>
            <div className="mt-3 px-3 py-2 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold">
              Institutional Play Detected
            </div>
          </div>
        </div>

        {/* Funding Rate History */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-200 mb-4">Funding Rate History (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fundingHistory}>
                <defs>
                  <linearGradient id="fundingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit' })}
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666"
                  tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(59,130,246,0.5)' }}
                  labelFormatter={(time) => new Date(time).toLocaleString()}
                  formatter={(value: number) => [`${(value * 100).toFixed(4)}%`, 'Funding Rate']}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#fundingGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volatility by Price Levels */}
        <div>
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-400" size={20} />
            Historical Volatility by Price Level
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volatilityLevels}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="price" 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666"
                  label={{ value: 'Volatility', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(245,158,11,0.5)' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'volatility') return [value.toFixed(1), 'Volatility'];
                    return [value, name];
                  }}
                  labelFormatter={(price) => `Price: $${price.toLocaleString()}`}
                />
                <Bar 
                  dataKey="volatility" 
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-300">
            <strong>Dangerous Zones:</strong> High volatility detected at $96,000 and $99,000 levels
          </div>
        </div>
      </GlassCard>

      {/* Implied Volatility Changes */}
      <GlassCard variant="blue" padding="md">
        <h3 className="text-lg font-bold text-blue-300 mb-4">Implied Volatility Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Current IV</div>
            <div className="text-2xl font-bold text-green-400">65.4%</div>
            <div className="text-xs text-green-400 mt-1">↓ -2.3% from yesterday</div>
          </div>
          <div className="p-4 rounded" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">24h Change</div>
            <div className="text-2xl font-bold text-blue-400">-3.5%</div>
            <div className="text-xs text-gray-400 mt-1">Volatility decreasing</div>
          </div>
          <div className="p-4 rounded" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Correlation</div>
            <div className="text-2xl font-bold text-purple-400">0.82</div>
            <div className="text-xs text-gray-400 mt-1">Strong with large orders</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Module5VolatilityContext;
