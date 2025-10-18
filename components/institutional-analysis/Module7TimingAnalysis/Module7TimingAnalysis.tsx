'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard, EducationalTooltip } from '../shared';
import { Clock, Calendar, TrendingUp, Brain, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTrades } from '@/lib/hyperliquid/hooks';
import type { HourlyVolumeData, MacroEvent, TraderTimingPattern, BehavioralInsight } from './types';

const Module7TimingAnalysis: React.FC = () => {
  const { trades, isConnected } = useTrades('BTC');
  const [hourlyVolume, setHourlyVolume] = useState<HourlyVolumeData[]>([]);
  
  // Calculate hourly volume distribution from real trades
  useEffect(() => {
    if (trades.length > 0) {
      const volumeByHour: Record<number, { volume: number; trades: number; totalPrice: number }> = {};
      
      // Initialize all 24 hours
      for (let i = 0; i < 24; i++) {
        volumeByHour[i] = { volume: 0, trades: 0, totalPrice: 0 };
      }
      
      // Aggregate trades by hour
      trades.forEach(trade => {
        const hour = trade.timestamp.getHours();
        volumeByHour[hour].volume += trade.volume;
        volumeByHour[hour].trades += 1;
        volumeByHour[hour].totalPrice += trade.price;
      });
      
      // Convert to array format for charts
      const hourlyData: HourlyVolumeData[] = Object.entries(volumeByHour).map(([hour, data]) => ({
        hour: parseInt(hour),
        volume: data.volume,
        trades: data.trades,
        avgPrice: data.trades > 0 ? data.totalPrice / data.trades : 0,
      }));
      
      setHourlyVolume(hourlyData);
    }
  }, [trades]);

  // Mock macro events (in production, this would come from an API or database)
  const macroEvents: MacroEvent[] = useMemo(() => {
    const now = new Date();
    return [
      {
        id: '1',
        timestamp: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        title: 'Fed Interest Rate Decision',
        description: 'Federal Reserve announces interest rate policy',
        impact: 'HIGH',
        category: 'ECONOMIC',
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        title: 'BTC Options Expiry',
        description: '$2.5B in BTC options expire',
        impact: 'MEDIUM',
        category: 'MARKET',
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        title: 'CPI Data Release',
        description: 'Monthly Consumer Price Index report',
        impact: 'HIGH',
        category: 'ECONOMIC',
      },
    ];
  }, []);

  // Calculate top trader timing patterns
  const traderPatterns: TraderTimingPattern[] = useMemo(() => {
    // In production, this would analyze historical trader data from Redis
    return [
      {
        traderId: 'Whale #1',
        preferredHours: [9, 10, 14, 15],
        avgPositionSize: 125.5,
        successRate: 68.5,
        totalTrades: 234,
      },
      {
        traderId: 'Institutional Fund A',
        preferredHours: [8, 9, 16, 17],
        avgPositionSize: 89.2,
        successRate: 72.1,
        totalTrades: 156,
      },
      {
        traderId: 'Market Maker #3',
        preferredHours: [0, 1, 2, 22, 23],
        avgPositionSize: 45.8,
        successRate: 61.3,
        totalTrades: 892,
      },
    ];
  }, []);

  // Generate behavioral insights
  const insights: BehavioralInsight[] = useMemo(() => {
    const peakVolume = Math.max(...hourlyVolume.map(h => h.volume));
    const peakHour = hourlyVolume.find(h => h.volume === peakVolume);
    
    return [
      {
        id: '1',
        insight: peakHour 
          ? `Peak trading volume occurs at ${peakHour.hour}:00 UTC with ${peakHour.trades} trades`
          : 'Analyzing trading patterns...',
        confidence: 85,
        relatedData: { peakHour: peakHour?.hour },
      },
      {
        id: '2',
        insight: 'Institutional traders show increased activity during US market hours (14:00-21:00 UTC)',
        confidence: 78,
        relatedData: { timeRange: '14-21' },
      },
      {
        id: '3',
        insight: 'Low volume periods (2:00-6:00 UTC) show higher volatility and stop hunting patterns',
        confidence: 71,
        relatedData: { timeRange: '2-6' },
      },
    ];
  }, [hourlyVolume]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-purple-200">Timing Analysis</h2>
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Analyze market timing patterns, institutional trading hours, and upcoming macro events
        </p>

        {/* Hourly Volume Distribution */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Activity className="text-blue-400" size={20} />
            24-Hour Volume Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyVolume}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#666"
                  tickFormatter={(hour) => `${hour}:00`}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666"
                  tickFormatter={(value) => value.toFixed(1)}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Volume', angle: -90, position: 'insideLeft', style: { fill: '#999' } }}
                />
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(139,92,246,0.5)' }}
                  labelFormatter={(hour) => `${hour}:00 UTC`}
                  formatter={(value: number, name: string) => {
                    if (name === 'volume') return [value.toFixed(2), 'Volume'];
                    if (name === 'trades') return [value, 'Trades'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="volume" fill="url(#volumeGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* Macro Events Calendar and Trader Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Macro Events Calendar */}
        <GlassCard variant="blue" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold text-blue-300">Upcoming Macro Events</h3>
          </div>
          <div className="space-y-3">
            {macroEvents.map(event => {
              const timeUntil = event.timestamp.getTime() - Date.now();
              const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
              const impactColors = {
                HIGH: 'border-red-500/50 bg-red-500/10',
                MEDIUM: 'border-yellow-500/50 bg-yellow-500/10',
                LOW: 'border-green-500/50 bg-green-500/10',
              };
              
              return (
                <div 
                  key={event.id}
                  className={`p-3 rounded-lg border ${impactColors[event.impact]}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-white text-sm">{event.title}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      event.impact === 'HIGH' ? 'bg-red-500/30 text-red-300' :
                      event.impact === 'MEDIUM' ? 'bg-yellow-500/30 text-yellow-300' :
                      'bg-green-500/30 text-green-300'
                    }`}>
                      {event.impact}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{event.description}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{event.category}</span>
                    <span className="text-purple-400 font-semibold">
                      {hoursUntil > 0 ? `in ${hoursUntil}h` : 'Now'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top Trader Timing Patterns */}
        <GlassCard variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={20} />
            <h3 className="text-lg font-bold text-gray-200">Top Trader Timing Patterns</h3>
          </div>
          <div className="space-y-4">
            {traderPatterns.map(pattern => (
              <div 
                key={pattern.traderId}
                className="p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-white text-sm">{pattern.traderId}</div>
                  <div className="text-xs text-green-400 font-semibold">
                    {pattern.successRate.toFixed(1)}% success
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Preferred Hours: {pattern.preferredHours.map(h => `${h}:00`).join(', ')}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Avg Size: {pattern.avgPositionSize.toFixed(1)} BTC</span>
                  <span className="text-gray-500">{pattern.totalTrades} trades</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Behavioral Insights */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Behavioral Insights</h3>
        </div>
        <div className="space-y-3">
          {insights.map(insight => (
            <div 
              key={insight.id}
              className="p-4 rounded-lg"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white text-sm mb-2">{insight.insight}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden max-w-xs">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${insight.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Educational Tooltip */}
      <EducationalTooltip
        title="Análisis de Timing y Patrones Temporales"
        content={
          <div>
            <p className="mb-3">
              El <strong>timing</strong> es crucial en trading. Los traders institucionales operan en horarios específicos 
              basados en liquidez, eventos macroeconómicos y patrones históricos.
            </p>
            <p className="mb-3">
              <strong>Distribución Horaria:</strong> Muestra cuándo hay más actividad. 
              Picos durante horarios de EE.UU. (14:00-21:00 UTC) indican participación institucional.
            </p>
            <p>
              <strong>Eventos Macro:</strong> CPI, decisiones de Fed, vencimientos de opciones pueden causar 
              volatilidad extrema. Los institucionales posicionan antes del evento.
            </p>
          </div>
        }
        examples={[
          'Si los top traders operan a las 14:00 UTC con éxito del 72%, considera hacer lo mismo.',
          'Volumen bajo de 2:00-6:00 UTC + alta volatilidad = zona de stop hunting.',
          'Antes de eventos HIGH impact, los institucionales reducen posiciones o se cubren.',
        ]}
        tips={[
          'Evita operar en horas de bajo volumen a menos que seas muy experimentado.',
          'Eventos HIGH impact pueden invalidar análisis técnico - ten precaución.',
          'Patrones de timing se repiten - estudia el comportamiento histórico de grandes traders.',
        ]}
      />
    </div>
  );
};

export default Module7TimingAnalysis;
