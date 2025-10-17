'use client';

import React from 'react';
import type { TradeSetup, SetupPerformance } from '../types';

export interface SetupDetailModalProps {
  setup: TradeSetup;
  performance?: SetupPerformance | null;
  onClose: () => void;
  onTrigger?: () => void;
}

export function SetupDetailModal({
  setup,
  performance,
  onClose,
  onTrigger,
}: SetupDetailModalProps) {
  const isProfitable = performance && performance.pnl > 0;
  const isLoss = performance && performance.pnl < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass border-b border-white/10 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{setup.description}</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                setup.type === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {setup.type.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                setup.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                setup.status === 'triggered' ? 'bg-yellow-500/20 text-yellow-400' :
                setup.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {setup.status.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                Quality: {setup.quality.toFixed(0)}/100
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Performance (if available) */}
          {performance && (
            <div className={`p-4 rounded-xl border-2 ${
              isProfitable ? 'bg-green-500/10 border-green-500/50' :
              isLoss ? 'bg-red-500/10 border-red-500/50' :
              'bg-white/5 border-white/20'
            }`}>
              <h3 className="text-lg font-semibold text-white mb-3">Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/60">P&L</p>
                  <p className={`text-2xl font-bold ${
                    isProfitable ? 'text-green-400' :
                    isLoss ? 'text-red-400' :
                    'text-white'
                  }`}>
                    {performance.pnl >= 0 ? '+' : ''}{performance.pnl.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Status</p>
                  <p className="text-lg font-semibold text-white capitalize">{performance.status}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Max Profit</p>
                  <p className="text-lg font-semibold text-green-400">
                    +{performance.maxProfit.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Max Drawdown</p>
                  <p className="text-lg font-semibold text-red-400">
                    {performance.maxDrawdown.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Levels */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Price Levels</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Entry</span>
                <span className="text-xl font-bold text-white">${setup.entry.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Target 1</span>
                <span className="text-lg font-semibold text-green-400">
                  ${setup.target1.toFixed(2)}
                  <span className="text-sm ml-2">
                    ({((setup.target1 - setup.entry) / setup.entry * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Target 2</span>
                <span className="text-lg font-semibold text-green-400">
                  ${setup.target2.toFixed(2)}
                  <span className="text-sm ml-2">
                    ({((setup.target2 - setup.entry) / setup.entry * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Stop Loss</span>
                <span className="text-lg font-semibold text-red-400">
                  ${setup.stopLoss.toFixed(2)}
                  <span className="text-sm ml-2">
                    ({((setup.stopLoss - setup.entry) / setup.entry * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-white/60">Risk:Reward</span>
                <span className="text-xl font-bold text-purple-400">
                  1:{setup.riskRewardRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Setup Reasoning</h3>
            <ul className="space-y-2">
              {setup.reasoning.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-white/80">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          {setup.risks.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">⚠️ Risks</h3>
              <ul className="space-y-2">
                {setup.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">!</span>
                    <span className="text-white/80">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Patterns */}
          {setup.patterns.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Supporting Patterns</h3>
              <div className="space-y-2">
                {setup.patterns.map((pattern) => (
                  <div key={pattern.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-white/80">{pattern.type.replace('_', ' ')}</span>
                    <div className="flex gap-2">
                      <span className="text-xs text-white/60">
                        Confidence: {(pattern.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-white/60">
                        Strength: {pattern.strength.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volume Profile */}
          {setup.volumeProfile && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Volume Profile</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-white/60">POC</p>
                  <p className="text-white font-semibold">${setup.volumeProfile.poc.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">VAH</p>
                  <p className="text-white font-semibold">${setup.volumeProfile.vah.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">VAL</p>
                  <p className="text-white font-semibold">${setup.volumeProfile.val.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mean Reversion */}
          {setup.meanReversion && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Mean Reversion</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/60">Type</p>
                  <p className="text-white font-semibold capitalize">{setup.meanReversion.type}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Deviation</p>
                  <p className="text-white font-semibold">{setup.meanReversion.deviation.toFixed(2)}σ</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Mean Price</p>
                  <p className="text-white font-semibold">${setup.meanReversion.meanPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Probability</p>
                  <p className="text-white font-semibold">
                    {(setup.meanReversion.reversionProbability * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-white/60">Coin</p>
                <p className="text-white">{setup.coin}</p>
              </div>
              <div>
                <p className="text-white/60">Timeframe</p>
                <p className="text-white">{setup.timeframe}</p>
              </div>
              <div>
                <p className="text-white/60">Created</p>
                <p className="text-white">{new Date(setup.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/60">ID</p>
                <p className="text-white/60 text-xs font-mono">{setup.id}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {setup.status === 'active' && onTrigger && (
            <div className="flex gap-3">
              <button
                onClick={onTrigger}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 
                         hover:from-green-600 hover:to-emerald-600 text-white font-semibold 
                         transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Mark as Triggered
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white 
                         transition-colors"
              >
                Close
              </button>
            </div>
          )}
          {setup.status !== 'active' && (
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white 
                       transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
