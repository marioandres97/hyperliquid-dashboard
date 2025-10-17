'use client';

import React from 'react';
import type { DetectedPattern, PatternType } from '../types';

export interface PatternDetailsProps {
  pattern: DetectedPattern | null;
  onClose?: () => void;
}

const PATTERN_ICONS: Record<PatternType, string> = {
  absorption_zone: '🌊',
  liquidation_cascade: '⚡',
  support_level: '🛡️',
  resistance_level: '🚧',
  whale_accumulation: '🐋⬆️',
  whale_distribution: '🐋⬇️',
  breakout: '🚀',
  breakdown: '⬇️',
};

const PATTERN_COLORS: Record<PatternType, string> = {
  absorption_zone: 'from-blue-500/20 to-cyan-500/20',
  liquidation_cascade: 'from-orange-500/20 to-red-500/20',
  support_level: 'from-green-500/20 to-emerald-500/20',
  resistance_level: 'from-red-500/20 to-rose-500/20',
  whale_accumulation: 'from-purple-500/20 to-pink-500/20',
  whale_distribution: 'from-pink-500/20 to-rose-500/20',
  breakout: 'from-emerald-500/20 to-teal-500/20',
  breakdown: 'from-rose-500/20 to-red-500/20',
};

export function PatternDetails({ pattern, onClose }: PatternDetailsProps) {
  if (!pattern) {
    return null;
  }

  const formatPatternName = (type: PatternType): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      if (value > 1000) {
        return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
      return value.toFixed(2);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const getRecommendation = (pattern: DetectedPattern): string => {
    switch (pattern.type) {
      case 'absorption_zone':
        return pattern.metadata.side === 'buy'
          ? 'Strong buy absorption detected. Consider entering long positions near this level.'
          : 'Strong sell absorption detected. Exercise caution with long positions.';
      
      case 'liquidation_cascade':
        return pattern.metadata.risk === 'high'
          ? 'High cascade risk. Consider reducing leverage and placing tight stop losses.'
          : 'Moderate cascade risk detected. Monitor price action closely.';
      
      case 'support_level':
        return 'Price approaching support. Watch for bounce or breakdown. Consider buy opportunities if support holds.';
      
      case 'resistance_level':
        return 'Price approaching resistance. Watch for rejection or breakout. Consider taking profits or waiting for confirmation.';
      
      case 'whale_accumulation':
        return 'Whales are accumulating. This could indicate bullish sentiment. Consider joining the trend.';
      
      case 'whale_distribution':
        return 'Whales are distributing. This could indicate bearish sentiment. Exercise caution.';
      
      case 'breakout':
        return 'Breakout confirmed. Consider entering long positions with proper risk management.';
      
      case 'breakdown':
        return 'Breakdown confirmed. Consider closing long positions or entering shorts with proper risk management.';
      
      default:
        return 'Monitor this pattern and adjust your strategy accordingly.';
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{PATTERN_ICONS[pattern.type]}</span>
          <div>
            <h3 className="text-2xl font-semibold text-white">
              {formatPatternName(pattern.type)}
            </h3>
            <p className="text-sm text-white/60">
              Detected at {new Date(pattern.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Gradient banner */}
      <div className={`bg-gradient-to-r ${PATTERN_COLORS[pattern.type]} rounded-lg p-4 mb-6`}>
        <p className="text-white text-lg">{pattern.description}</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-white/60 mb-1">Price Level</div>
          <div className="text-2xl font-bold text-white">
            ${pattern.price.toFixed(2)}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-white/60 mb-1">Strength</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">
              {pattern.strength.toFixed(0)}%
            </div>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${pattern.strength}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-white/60 mb-1">Confidence</div>
          <div className={`text-2xl font-bold ${
            pattern.confidence >= 0.8 ? 'text-green-400' :
            pattern.confidence >= 0.6 ? 'text-yellow-400' :
            'text-orange-400'
          }`}>
            {(pattern.confidence * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-sm text-white/60 mb-1">Signal Score</div>
          <div className="text-2xl font-bold text-purple-400">
            {(pattern.strength * pattern.confidence).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Metadata */}
      {Object.keys(pattern.metadata).length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Additional Details</h4>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(pattern.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/60 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-white font-medium">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
        <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Trading Insight</h4>
        <p className="text-white/80 text-sm leading-relaxed">
          {getRecommendation(pattern)}
        </p>
      </div>
    </div>
  );
}
