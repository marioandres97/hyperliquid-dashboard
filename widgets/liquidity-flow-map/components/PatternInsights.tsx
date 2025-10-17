'use client';

import React from 'react';
import type { DetectedPattern, PatternType } from '../types';

export interface PatternInsightsProps {
  patterns: DetectedPattern[];
  onPatternClick?: (pattern: DetectedPattern) => void;
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
  absorption_zone: 'text-blue-400',
  liquidation_cascade: 'text-orange-400',
  support_level: 'text-green-400',
  resistance_level: 'text-red-400',
  whale_accumulation: 'text-purple-400',
  whale_distribution: 'text-pink-400',
  breakout: 'text-emerald-400',
  breakdown: 'text-rose-400',
};

export function PatternInsights({ patterns, onPatternClick }: PatternInsightsProps) {
  if (patterns.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Pattern Insights</h3>
        <p className="text-white/60 text-center">No patterns detected</p>
      </div>
    );
  }

  // Sort patterns by confidence * strength
  const sortedPatterns = [...patterns].sort((a, b) => {
    const scoreA = a.confidence * a.strength;
    const scoreB = b.confidence * b.strength;
    return scoreB - scoreA;
  });

  // Group patterns by type
  const patternsByType = sortedPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.type]) {
      acc[pattern.type] = [];
    }
    acc[pattern.type].push(pattern);
    return acc;
  }, {} as Record<PatternType, DetectedPattern[]>);

  const formatPatternName = (type: PatternType): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Pattern Insights</h3>
        <span className="text-sm text-white/60">
          {patterns.length} pattern{patterns.length !== 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="space-y-3">
        {Object.entries(patternsByType).map(([type, typePatterns]) => (
          <div key={type} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{PATTERN_ICONS[type as PatternType]}</span>
              <div>
                <h4 className={`font-semibold ${PATTERN_COLORS[type as PatternType]}`}>
                  {formatPatternName(type as PatternType)}
                </h4>
                <p className="text-xs text-white/50">
                  {typePatterns.length} occurrence{typePatterns.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {typePatterns.slice(0, 3).map((pattern) => (
                <div
                  key={pattern.id}
                  onClick={() => onPatternClick?.(pattern)}
                  className="bg-white/5 rounded p-3 hover:bg-white/10 transition-all cursor-pointer border border-white/5 hover:border-white/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-white/80">{pattern.description}</p>
                    <span className="text-xs text-white/50">
                      ${pattern.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 items-center">
                    {/* Strength bar */}
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Strength</span>
                        <span>{pattern.strength.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all`}
                          style={{ width: `${pattern.strength}%` }}
                        />
                      </div>
                    </div>

                    {/* Confidence indicator */}
                    <div className="text-center">
                      <div className="text-xs text-white/50 mb-1">Confidence</div>
                      <div className={`text-sm font-semibold ${
                        pattern.confidence >= 0.8 ? 'text-green-400' :
                        pattern.confidence >= 0.6 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                        {(pattern.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-white/40">
                    {new Date(pattern.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {typePatterns.length > 3 && (
                <p className="text-xs text-white/40 text-center pt-2">
                  +{typePatterns.length - 3} more
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
