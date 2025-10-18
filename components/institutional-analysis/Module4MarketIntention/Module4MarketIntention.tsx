'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../shared';
import { Target, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface AccumulationZone {
  type: 'LONG' | 'SHORT';
  priceMin: number;
  priceMax: number;
  intensity: number;
  confidence: number;
  traders: number;
}

interface PatternDetection {
  type: 'stop_hunt' | 'accumulation';
  confidence: number;
  price: number;
  timestamp: Date;
  description: string;
}

const Module4MarketIntention: React.FC = () => {
  const [zones, setZones] = useState<AccumulationZone[]>([]);
  const [patterns, setPatterns] = useState<PatternDetection[]>([]);

  useEffect(() => {
    // Mock data generation
    const mockZones: AccumulationZone[] = [
      { type: 'SHORT', priceMin: 98000, priceMax: 99000, intensity: 85, confidence: 92, traders: 12 },
      { type: 'LONG', priceMin: 95000, priceMax: 96000, intensity: 72, confidence: 78, traders: 8 },
    ];

    const mockPatterns: PatternDetection[] = [
      {
        type: 'stop_hunt',
        confidence: 87,
        price: 97200,
        timestamp: new Date(),
        description: 'Liquidity removed at $97,200, followed by opposite direction orders',
      },
      {
        type: 'accumulation',
        confidence: 93,
        price: 95500,
        timestamp: new Date(),
        description: 'Sustained buying pressure detected in $95,000-$96,000 range',
      },
    ];

    setZones(mockZones);
    setPatterns(mockPatterns);

    const interval = setInterval(() => {
      const newPattern: PatternDetection = {
        type: Math.random() > 0.5 ? 'stop_hunt' : 'accumulation',
        confidence: Math.floor(Math.random() * 30 + 70),
        price: 97500 + (Math.random() - 0.5) * 2000,
        timestamp: new Date(),
        description: Math.random() > 0.5 
          ? 'Liquidity anomaly detected - potential stop hunt'
          : 'Institutional accumulation detected',
      };
      setPatterns(prev => [newPattern, ...prev].slice(0, 10));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center gap-2 mb-6">
          <Target className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-purple-200">Market Intention Detection</h2>
        </div>

        {/* Accumulation Zones */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Institutional Accumulation Zones
          </h3>
          <div className="space-y-3">
            {zones.map((zone, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg"
                style={{
                  background: zone.type === 'LONG' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: zone.type === 'LONG' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-bold text-lg ${zone.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                        {zone.type} ACCUMULATION
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                        {zone.traders} traders
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      Top traders accumulating {zone.type} between{' '}
                      <span className="font-mono font-bold">${zone.priceMin.toLocaleString()}</span>
                      {' - '}
                      <span className="font-mono font-bold">${zone.priceMax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Intensity: </span>
                        <span className="font-bold text-yellow-400">{zone.intensity}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Confidence: </span>
                        <span className="font-bold text-blue-400">{zone.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                      background: `conic-gradient(${zone.type === 'LONG' ? '#10B981' : '#EF4444'} ${zone.intensity * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                    }}>
                      <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center">
                        <span className="font-bold text-white">{zone.intensity}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Detection */}
        <div>
          <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-400" />
            Pattern Detection & Analysis
          </h3>
          <div className="space-y-3">
            {patterns.map((pattern, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg"
                style={{
                  background: pattern.type === 'stop_hunt' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  border: pattern.type === 'stop_hunt' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {pattern.type === 'stop_hunt' ? (
                      <AlertTriangle className="text-red-400" size={20} />
                    ) : (
                      <TrendingUp className="text-blue-400" size={20} />
                    )}
                    <span className={`font-bold ${pattern.type === 'stop_hunt' ? 'text-red-400' : 'text-blue-400'}`}>
                      {pattern.type === 'stop_hunt' ? 'STOP HUNTING' : 'REAL ACCUMULATION'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Confidence</div>
                    <div className="font-bold text-yellow-400">{pattern.confidence}%</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-2">{pattern.description}</div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Price: <span className="font-mono text-white">${pattern.price.toLocaleString()}</span></span>
                  <span>{pattern.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Intention Summary */}
      <GlassCard variant="blue" padding="md">
        <h3 className="text-lg font-bold text-blue-300 mb-4">Market Intention Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded bg-black/30">
            <span className="text-gray-400">Dominant Pattern: </span>
            <span className="font-bold text-white">
              {patterns[0]?.type === 'accumulation' ? 'Institutional Accumulation' : 'Stop Hunt Activity'}
            </span>
          </div>
          <div className="p-3 rounded bg-black/30">
            <span className="text-gray-400">Current Strategy: </span>
            <span className="font-bold text-white">
              {zones[0]?.type === 'SHORT' 
                ? 'Bearish positioning with high confidence'
                : 'Bullish accumulation in support zones'}
            </span>
          </div>
          <div className="p-3 rounded bg-black/30">
            <span className="text-gray-400">Risk Level: </span>
            <span className="font-bold text-yellow-400">
              {patterns.filter(p => p.type === 'stop_hunt').length > 2 ? 'HIGH' : 'MODERATE'}
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Module4MarketIntention;
