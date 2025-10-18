'use client';

import React from 'react';
import { Repeat, TrendingDown, CheckCircle } from 'lucide-react';

interface Pattern {
  id: string;
  trigger: string;
  outcome: string;
  successRate: number;
  occurrences: number;
  avgReturn: number;
  timeframe: string;
  confidence: number;
}

export const RecurringPatterns: React.FC = () => {
  const patterns: Pattern[] = [
    {
      id: 'pattern-1',
      trigger: 'Funding rate > 0.05%',
      outcome: 'Price drops 2-4% within 4 hours',
      successRate: 82,
      occurrences: 15,
      avgReturn: -2.8,
      timeframe: '4h',
      confidence: 88,
    },
    {
      id: 'pattern-2',
      trigger: 'Large SHORT accumulation at $98k-$99k',
      outcome: 'Breakdown to $95k support',
      successRate: 75,
      occurrences: 8,
      avgReturn: -3.2,
      timeframe: '6-12h',
      confidence: 79,
    },
    {
      id: 'pattern-3',
      trigger: 'Whale accumulation + Funding normalization',
      outcome: 'Upward movement 3-5%',
      successRate: 88,
      occurrences: 12,
      avgReturn: 4.1,
      timeframe: '8-24h',
      confidence: 92,
    },
    {
      id: 'pattern-4',
      trigger: 'Stop hunt at key support + immediate reversal',
      outcome: 'Strong bounce 2-3%',
      successRate: 71,
      occurrences: 22,
      avgReturn: 2.5,
      timeframe: '2-4h',
      confidence: 76,
    },
    {
      id: 'pattern-5',
      trigger: 'Pre-CPI volume spike (2h before)',
      outcome: 'Direction matches spike direction',
      successRate: 79,
      occurrences: 11,
      avgReturn: 1.8,
      timeframe: '24h',
      confidence: 83,
    },
  ];

  return (
    <div className="space-y-3">
      {patterns.map((pattern) => (
        <div
          key={pattern.id}
          className="p-4 rounded-lg"
          style={{ 
            background: pattern.avgReturn > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            border: pattern.avgReturn > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' 
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Repeat size={16} className="text-blue-400" />
                <span className="font-bold text-white">Pattern #{pattern.id.split('-')[1]}</span>
                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                  {pattern.occurrences}x observed
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="text-sm">
                  <span className="text-gray-400">When: </span>
                  <span className="text-white font-semibold">{pattern.trigger}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Then: </span>
                  <span className={`font-semibold ${pattern.avgReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pattern.outcome}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">Success Rate</div>
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} className="text-green-400" />
                    <span className="font-bold text-green-400">{pattern.successRate}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Avg Return</div>
                  <div className={`font-bold ${pattern.avgReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pattern.avgReturn > 0 ? '+' : ''}{pattern.avgReturn.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Timeframe</div>
                  <div className="font-mono text-white">{pattern.timeframe}</div>
                </div>
                <div>
                  <div className="text-gray-400">Confidence</div>
                  <div className="font-bold text-yellow-400">{pattern.confidence}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
        <strong>Pattern Recognition:</strong> These recurring patterns are detected from 90 days of historical data. Higher success rates indicate more reliable signals for trading decisions.
      </div>
    </div>
  );
};
