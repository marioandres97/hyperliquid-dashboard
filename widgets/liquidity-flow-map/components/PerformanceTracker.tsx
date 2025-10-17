'use client';

import React, { useMemo } from 'react';
import type { SetupPerformance, TradeSetup } from '../types';

export interface PerformanceTrackerProps {
  performances: SetupPerformance[];
  setups: TradeSetup[];
  onSelectSetup?: (setupId: string) => void;
}

export function PerformanceTracker({
  performances,
  setups,
  onSelectSetup,
}: PerformanceTrackerProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const wins = performances.filter(p => p.status === 'win').length;
    const losses = performances.filter(p => p.status === 'loss').length;
    const open = performances.filter(p => p.status === 'open').length;
    const total = performances.length;

    const winRate = total > 0 ? (wins / (wins + losses)) * 100 : 0;
    
    const avgPnL = performances.length > 0
      ? performances.reduce((sum, p) => sum + p.pnl, 0) / performances.length
      : 0;

    const totalPnL = performances.reduce((sum, p) => p.pnl, 0);

    const bestTrade = performances.reduce((best, current) => 
      current.pnl > best.pnl ? current : best
    , performances[0] || { pnl: 0 });

    const worstTrade = performances.reduce((worst, current) =>
      current.pnl < worst.pnl ? current : worst
    , performances[0] || { pnl: 0 });

    return {
      wins,
      losses,
      open,
      total,
      winRate,
      avgPnL,
      totalPnL,
      bestTrade,
      worstTrade,
    };
  }, [performances]);

  // Get setup details for a performance
  const getSetupDetails = (setupId: string) => {
    return setups.find(s => s.id === setupId);
  };

  // Group performances by status
  const openPerformances = performances.filter(p => p.status === 'open');
  const closedPerformances = performances.filter(p => p.status !== 'open')
    .sort((a, b) => (b.exitTime || 0) - (a.exitTime || 0));

  return (
    <div className="glass rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>📈</span>
          <span>Performance Tracker</span>
        </h3>
        {stats.total > 0 && (
          <span className="text-sm text-white/60">{stats.total} setups</span>
        )}
      </div>

      {/* Statistics Grid */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Win Rate</p>
            <p className={`text-2xl font-bold ${
              stats.winRate >= 50 ? 'text-green-400' : 'text-orange-400'
            }`}>
              {stats.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-white/60 mt-1">
              {stats.wins}W / {stats.losses}L
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${
              stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Avg P&L</p>
            <p className={`text-2xl font-bold ${
              stats.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.avgPnL >= 0 ? '+' : ''}{stats.avgPnL.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Open Setups</p>
            <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
          </div>
        </div>
      )}

      {/* Best/Worst Trades */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {stats.bestTrade && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs text-green-400 mb-1">🏆 Best Trade</p>
              <p className="text-xl font-bold text-green-400">
                +{stats.bestTrade.pnl.toFixed(2)}%
              </p>
            </div>
          )}
          {stats.worstTrade && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-400 mb-1">📉 Worst Trade</p>
              <p className="text-xl font-bold text-red-400">
                {stats.worstTrade.pnl.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Open Positions */}
      {openPerformances.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/80 mb-3">Open Positions</h4>
          <div className="space-y-2">
            {openPerformances.map((perf) => {
              const setup = getSetupDetails(perf.setupId);
              return (
                <div
                  key={perf.setupId}
                  onClick={() => onSelectSetup?.(perf.setupId)}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {setup?.description || perf.setupId}
                      </p>
                      {setup && (
                        <p className="text-xs text-white/60">
                          {setup.coin} • {setup.type.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${
                      perf.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {perf.pnl >= 0 ? '+' : ''}{perf.pnl.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Max Profit: <span className="text-green-400">+{perf.maxProfit.toFixed(2)}%</span></span>
                    <span>Max DD: <span className="text-red-400">{perf.maxDrawdown.toFixed(2)}%</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Closed Positions */}
      {closedPerformances.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white/80 mb-3">
            Closed Positions ({closedPerformances.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {closedPerformances.slice(0, 10).map((perf) => {
              const setup = getSetupDetails(perf.setupId);
              const isWin = perf.status === 'win';
              const isLoss = perf.status === 'loss';

              return (
                <div
                  key={perf.setupId}
                  onClick={() => onSelectSetup?.(perf.setupId)}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {setup?.description || perf.setupId}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isWin ? 'bg-green-500/20 text-green-400' :
                          isLoss ? 'bg-red-500/20 text-red-400' :
                          'bg-white/20 text-white/60'
                        }`}>
                          {perf.status.toUpperCase()}
                        </span>
                      </div>
                      {setup && (
                        <p className="text-xs text-white/60 mt-1">
                          {setup.coin} • {setup.type.toUpperCase()}
                        </p>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${
                      perf.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {perf.pnl >= 0 ? '+' : ''}{perf.pnl.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                    {perf.entryTime && (
                      <div>
                        Entry: {new Date(perf.entryTime).toLocaleTimeString()}
                      </div>
                    )}
                    {perf.exitTime && (
                      <div>
                        Exit: {new Date(perf.exitTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Data State */}
      {stats.total === 0 && (
        <div className="text-center py-8">
          <p className="text-white/60">No performance data yet</p>
          <p className="text-sm text-white/40 mt-2">
            Trade setups will appear here once generated
          </p>
        </div>
      )}
    </div>
  );
}
