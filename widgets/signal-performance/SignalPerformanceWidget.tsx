'use client';

import { useSignalStats } from '@/widgets/signal-performance/useSignalStats';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

export function SignalPerformanceWidget() {
  const { stats, isLoading } = useSignalStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Win Rate Global */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Win Rate</span>
          <Target className="w-4 h-4 text-white/40" />
        </div>
        <div className="text-3xl font-bold text-white">
          {stats.winRate.toFixed(1)}%
        </div>
        <div className="text-xs text-white/50 mt-1">
          {stats.totalSignals} total signals
        </div>
      </div>

      {/* Stats por Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">Targets Hit</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {stats.byStatus.hit_target}
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-white/60">Stops Hit</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {stats.byStatus.hit_stop}
          </div>
        </div>
      </div>

      {/* Win Rate por Moneda */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white/70">By Coin</h3>
        {Object.entries(stats.byCoin).map(([coin, data]) => (
          <div key={coin} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{coin}</span>
              <span className="text-sm text-white/60">
                {data.wins}/{data.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.winRate}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white">
                {data.winRate.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}