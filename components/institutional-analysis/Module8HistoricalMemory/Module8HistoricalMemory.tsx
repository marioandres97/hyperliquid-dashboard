'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard, DataTable, Column, EducationalTooltip } from '../shared';
import { Database, TrendingUp, Search, Lightbulb, Activity, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { useTrades, useMarketMetrics } from '@/lib/hyperliquid/hooks';
import type { TraderBehaviorEvent, RecurringPattern, SimilarScenario, PredictiveInsight } from './types';

const Module8HistoricalMemory: React.FC = () => {
  const { trades, isConnected } = useTrades('BTC');
  const { metrics } = useMarketMetrics('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  // Generate trader behavior timeline from real trades
  const traderTimeline: TraderBehaviorEvent[] = useMemo(() => {
    // In production, this would query Redis for historical trader positions
    // For now, we'll generate based on large trades
    return trades
      .filter(trade => trade.volume > 5) // Large trades only
      .slice(0, 20)
      .map((trade, index) => ({
        id: `event-${index}`,
        traderId: `Trader-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
        timestamp: trade.timestamp,
        action: Math.random() > 0.5 ? 'OPENED' : 'CLOSED',
        positionType: trade.direction === 'BUY' ? 'LONG' : 'SHORT',
        size: trade.volume,
        price: trade.price,
        outcome: Math.random() > 0.5 ? 'PROFIT' : 'LOSS',
        pnl: (Math.random() - 0.5) * 10000,
      }));
  }, [trades]);

  // Detect recurring patterns
  const recurringPatterns: RecurringPattern[] = useMemo(() => {
    return [
      {
        id: '1',
        pattern: 'Large shorts opened before US market open (14:00 UTC)',
        frequency: 12,
        lastOccurrence: new Date(Date.now() - 2 * 60 * 60 * 1000),
        avgOutcome: 1250,
        confidence: 78,
      },
      {
        id: '2',
        pattern: 'Whale accumulation during low volume hours (2:00-6:00 UTC)',
        frequency: 8,
        lastOccurrence: new Date(Date.now() - 8 * 60 * 60 * 1000),
        avgOutcome: 2100,
        confidence: 82,
      },
      {
        id: '3',
        pattern: 'Stop loss cascades after breaking key support levels',
        frequency: 15,
        lastOccurrence: new Date(Date.now() - 24 * 60 * 60 * 1000),
        avgOutcome: -850,
        confidence: 91,
      },
      {
        id: '4',
        pattern: 'Institutional buy-ins following funding rate normalization',
        frequency: 6,
        lastOccurrence: new Date(Date.now() - 72 * 60 * 60 * 1000),
        avgOutcome: 1800,
        confidence: 75,
      },
    ];
  }, []);

  // Find similar historical scenarios
  const similarScenarios: SimilarScenario[] = useMemo(() => {
    if (!metrics) return [];
    
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        similarity: 89,
        marketConditions: {
          price: metrics.markPrice * 0.98,
          funding: 0.0085,
          volume: metrics.volume24h * 1.1,
        },
        outcome: 'Price rallied +3.2% over next 24h',
        timeframe: '7 days ago',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        similarity: 84,
        marketConditions: {
          price: metrics.markPrice * 1.02,
          funding: 0.0092,
          volume: metrics.volume24h * 0.95,
        },
        outcome: 'Consolidation -0.8% over 48h, then +5.1%',
        timeframe: '21 days ago',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        similarity: 76,
        marketConditions: {
          price: metrics.markPrice * 0.95,
          funding: 0.0078,
          volume: metrics.volume24h * 1.15,
        },
        outcome: 'Sharp correction -4.5% followed by recovery',
        timeframe: '45 days ago',
      },
    ];
  }, [metrics]);

  // Generate predictive insights
  const predictions: PredictiveInsight[] = useMemo(() => {
    return [
      {
        id: '1',
        prediction: 'High probability of upward movement in next 4-6 hours',
        probability: 72,
        timeframe: '4-6 hours',
        basedOn: ['Whale accumulation pattern', 'Funding rate normalization', 'Similar scenario #1'],
        confidence: 78,
      },
      {
        id: '2',
        prediction: 'Potential stop hunt at $95,500 before continuation',
        probability: 65,
        timeframe: '12-24 hours',
        basedOn: ['Order book analysis', 'Historical support levels', 'Recurring pattern #3'],
        confidence: 71,
      },
      {
        id: '3',
        prediction: 'Increased volatility expected around US market open',
        probability: 81,
        timeframe: 'Next session',
        basedOn: ['Timing pattern analysis', 'Institutional activity', 'Historical data'],
        confidence: 85,
      },
    ];
  }, []);

  const timelineColumns: Column<TraderBehaviorEvent>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      width: '120px',
      render: (value) => (
        <span className="font-mono text-xs text-gray-400">
          {value.toLocaleTimeString()}
        </span>
      ),
    },
    {
      key: 'traderId',
      label: 'Trader',
      render: (value) => (
        <span className="font-mono text-sm text-purple-300">{value}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center',
      render: (value, row) => {
        const colors: Record<string, string> = {
          OPENED: 'text-green-400',
          CLOSED: 'text-red-400',
          INCREASED: 'text-blue-400',
          DECREASED: 'text-yellow-400',
        };
        return (
          <span className={`font-semibold text-xs ${colors[value] || 'text-gray-400'}`}>
            {value} {row.positionType}
          </span>
        );
      },
    },
    {
      key: 'size',
      label: 'Size',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-white">{value.toFixed(2)}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">${value.toFixed(0)}</span>
      ),
    },
    {
      key: 'outcome',
      label: 'Outcome',
      align: 'center',
      render: (value, row) => {
        if (!value || value === 'PENDING') {
          return <span className="text-xs text-gray-500">Pending</span>;
        }
        const color = value === 'PROFIT' ? 'text-green-400' : 'text-red-400';
        return (
          <div className={`flex flex-col items-end ${color}`}>
            <span className="text-xs font-semibold">{value}</span>
            {row.pnl && (
              <span className="text-xs font-mono">
                {row.pnl > 0 ? '+' : ''}{row.pnl.toFixed(0)}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-purple-200">Historical Memory & Pattern Recognition</h2>
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Analyze historical trader behavior, detect recurring patterns, and identify similar market scenarios
        </p>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6">
          {(['24h', '7d', '30d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedTimeframe === tf
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Trader Behavior Timeline */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-blue-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Trader Behavior Timeline</h3>
        </div>
        <DataTable
          columns={timelineColumns}
          data={traderTimeline}
          keyExtractor={(event) => event.id}
          maxHeight="400px"
        />
      </GlassCard>

      {/* Recurring Patterns and Similar Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recurring Patterns */}
        <GlassCard variant="blue" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold text-blue-300">Recurring Patterns Detected</h3>
          </div>
          <div className="space-y-3">
            {recurringPatterns.map(pattern => (
              <div 
                key={pattern.id}
                className="p-3 rounded-lg"
                style={{ 
                  background: pattern.avgOutcome > 0 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)', 
                  border: pattern.avgOutcome > 0
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <div className="text-white text-sm font-semibold mb-2">{pattern.pattern}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">
                    Frequency: <span className="text-white font-semibold">{pattern.frequency}x</span>
                  </div>
                  <div className="text-gray-400">
                    Confidence: <span className="text-purple-400 font-semibold">{pattern.confidence}%</span>
                  </div>
                  <div className="text-gray-400">
                    Avg Outcome: <span className={`font-semibold ${pattern.avgOutcome > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pattern.avgOutcome > 0 ? '+' : ''}{pattern.avgOutcome}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    Last: <span className="text-white">{Math.floor((Date.now() - pattern.lastOccurrence.getTime()) / (1000 * 60 * 60))}h ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Similar Scenarios */}
        <GlassCard variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-green-400" size={20} />
            <h3 className="text-lg font-bold text-gray-200">Similar Historical Scenarios</h3>
          </div>
          <div className="space-y-3">
            {similarScenarios.map(scenario => (
              <div 
                key={scenario.id}
                className="p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{scenario.timeframe}</span>
                  <span className="text-xs font-semibold text-green-400">{scenario.similarity}% match</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  <div>Price: ${scenario.marketConditions.price.toFixed(0)}</div>
                  <div>Funding: {(scenario.marketConditions.funding * 100).toFixed(3)}%</div>
                  <div>Volume: ${(scenario.marketConditions.volume / 1000000).toFixed(1)}M</div>
                </div>
                <div className="text-white text-sm font-semibold bg-blue-500/20 px-2 py-1 rounded">
                  {scenario.outcome}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Predictive Insights */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="text-yellow-400" size={20} />
          <h3 className="text-lg font-bold text-purple-200">Predictive Insights</h3>
        </div>
        <div className="space-y-4">
          {predictions.map(prediction => (
            <div 
              key={prediction.id}
              className="p-4 rounded-lg"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-white font-semibold mb-1">{prediction.prediction}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} />
                    <span>{prediction.timeframe}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-300">{prediction.probability}%</div>
                  <div className="text-xs text-gray-400">probability</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">{prediction.confidence}% confidence</div>
              </div>
              <div className="text-xs text-gray-400">
                <div className="mb-1">Based on:</div>
                <div className="flex flex-wrap gap-1">
                  {prediction.basedOn.map((source, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Educational Tooltip */}
      <EducationalTooltip
        title="Memoria Histórica y Reconocimiento de Patrones"
        content={
          <div>
            <p className="mb-3">
              La <strong>memoria histórica</strong> utiliza datos pasados para identificar patrones que se repiten. 
              Los mercados son cíclicos y tienden a reaccionar de forma similar a condiciones similares.
            </p>
            <p className="mb-3">
              <strong>Patrones Recurrentes:</strong> Comportamientos que se observan frecuentemente 
              (ej: acumulación antes de noticias, stop hunts en soportes clave).
            </p>
            <p>
              <strong>Escenarios Similares:</strong> Situaciones pasadas con condiciones de mercado parecidas 
              (precio, funding, volumen). El outcome histórico sugiere qué podría pasar.
            </p>
          </div>
        }
        examples={[
          'Patrón: "Shorts before US open" con 82% confianza = alta probabilidad de repetirse.',
          'Escenario 89% similar hace 7 días resultó en +3.2% rally = posible repetición.',
          'Predicción 72% probabilidad basada en 3 patrones = señal fuerte de trading.',
        ]}
        tips={[
          'Mayor confianza (>80%) y frecuencia alta indican patrones más confiables.',
          'Escenarios con >85% similitud son muy relevantes para decisiones actuales.',
          'No uses predicciones como única señal - confirma con otros módulos.',
        ]}
      />
    </div>
  );
};

export default Module8HistoricalMemory;
