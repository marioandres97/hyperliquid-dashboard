'use client';

import { useState } from 'react';
import { useSignalStats } from '@/widgets/signal-performance/useSignalStats';
import { TrendingUp, TrendingDown, Target, RotateCcw } from 'lucide-react';

export function SignalPerformanceWidget() {
  const { stats, isLoading, refresh } = useSignalStats();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm('¿Seguro que quieres limpiar todos los datos de señales en Redis? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      setIsResetting(true);
      const res = await fetch('/api/signals/reset', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Reset failed with status ${res.status}`);
      }
      await refresh();
    } catch (e) {
      console.error(e);
      alert('No se pudieron limpiar las señales. Revisa la consola para más detalles.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header con botón Reset */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70">Overview</h3>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Reset signals in Redis"
        >
          <RotateCcw className="w-4 h-4" />
          {isResetting ? 'Resetting...' : 'Reset signals'}
        </button>
      </div>

      {/* Win Rate Global */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">Win Rate</span>
          <Target className="w-4 h-4 text-white/40" />
        </div>
        <div className="text-4xl font-bold text-white">
          {stats.winRate.toFixed(1)}%
        </div>
        <div className="text-xs text-white/50 mt-1">
          {stats.totalSignals} total signals
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-white/10 rounded-full h-2">
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.winRate}%` }}
          />
        </div>
      </div>

      {/* Stats por Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-white/60">Targets Hit</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {stats.byStatus.hit_target}
          </div>
          <div className="text-xs text-white/50 mt-1">
            {stats.totalSignals > 0 ? ((stats.byStatus.hit_target / stats.totalSignals) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-xs text-white/60">Stops Hit</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {stats.byStatus.hit_stop}
          </div>
          <div className="text-xs text-white/50 mt-1">
            {stats.totalSignals > 0 ? ((stats.byStatus.hit_stop / stats.totalSignals) * 100).toFixed(1) : 0}% of total
          </div>
        </div>
      </div>

      {/* Win Rate por Moneda */}
      <div className="flex-1 space-y-2 min-h-0">
        <h3 className="text-sm font-medium text-white/70">By Coin</h3>
        {Object.entries(stats.byCoin).map(([coin, data]) => (
          <div key={coin} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white text-lg">{coin}</span>
              <span className="text-sm text-white/60">
                {data.wins}/{data.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-full h-2.5">
                <div
                  className="bg-green-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${data.winRate}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white min-w-[50px] text-right">
                {data.winRate.toFixed(0)}%
              </span>
            </div>
            
            {/* Additional metrics per coin */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="text-white/50">
                Wins: <span className="text-green-400 font-medium">{data.wins}</span>
              </div>
              <div className="text-white/50">
                Losses: <span className="text-red-400 font-medium">{data.total - data.wins}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}