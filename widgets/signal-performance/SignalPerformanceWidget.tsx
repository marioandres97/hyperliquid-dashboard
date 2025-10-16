'use client';

import WidgetContainer from '@/components/layout/WidgetContainer';
import { useSignalStats } from '@/widgets/signal-performance/useSignalStats';
import { TrendingUp, TrendingDown, Target, Shield } from 'lucide-react';

export function SignalPerformanceWidget() {
  const { stats, isLoading } = useSignalStats();

  if (isLoading) {
    return (
      <WidgetContainer title="Signal Performance">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading stats...</p>
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Signal Performance">
      <div className="space-y-6">
        {/* Win Rate Global */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Win Rate</span>
            <Target className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.totalSignals} total signals
          </div>
        </div>

        {/* Stats por Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-400">Targets Hit</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {stats.byStatus.hit_target}
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-400">Stops Hit</span>
            </div>
            <div className="text-2xl font-bold text-red-500">
              {stats.byStatus.hit_stop}
            </div>
          </div>
        </div>

        {/* Win Rate por Moneda */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400">By Coin</h3>
          {Object.entries(stats.byCoin).map(([coin, data]) => (
            <div key={coin} className="bg-gray-800/30 rounded p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{coin}</span>
                <span className="text-sm text-gray-400">
                  {data.wins}/{data.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${data.winRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {data.winRate.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetContainer>
  );
}