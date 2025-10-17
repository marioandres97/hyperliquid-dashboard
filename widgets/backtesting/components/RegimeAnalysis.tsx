'use client';

import { RegimeStats } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RegimeAnalysisProps {
  bullPerformance: RegimeStats;
  bearPerformance: RegimeStats;
  sidewaysPerformance: RegimeStats;
}

export function RegimeAnalysis({ 
  bullPerformance, 
  bearPerformance, 
  sidewaysPerformance 
}: RegimeAnalysisProps) {
  const renderRegimeCard = (
    title: string,
    stats: RegimeStats,
    icon: React.ReactNode,
    colorClasses: { bg: string; border: string; text: string }
  ) => {
    const hasData = stats.totalTrades > 0;
    const isProfitable = stats.totalPnL >= 0;

    return (
      <div className={`${colorClasses.bg} ${colorClasses.border} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className={`text-sm font-bold ${colorClasses.text}`}>{title}</h4>
        </div>

        {hasData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Total PnL</span>
              <span className={`text-sm font-bold ${
                isProfitable ? 'text-green-400' : 'text-red-400'
              }`}>
                {isProfitable ? '+' : ''}${stats.totalPnL.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Win Rate</span>
              <span className="text-sm font-medium text-white">
                {(stats.winRate * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Trades</span>
              <span className="text-sm font-medium text-white">
                {stats.totalTrades}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Profit Factor</span>
              <span className={`text-sm font-bold ${
                stats.profitFactor > 1.5 ? 'text-green-400' :
                stats.profitFactor > 1.0 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {stats.profitFactor > 100 ? '∞' : stats.profitFactor.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Avg Win</span>
              <span className="text-sm text-green-400">
                +${stats.avgWin.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Avg Loss</span>
              <span className="text-sm text-red-400">
                -${stats.avgLoss.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-white/50">No trades in this regime</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white/70 mb-2">
        Performance by Market Regime
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {renderRegimeCard(
          'Bull Market',
          bullPerformance,
          <TrendingUp className="w-5 h-5 text-green-400" />,
          {
            bg: 'bg-green-500/10',
            border: 'border border-green-400/30',
            text: 'text-green-400'
          }
        )}

        {renderRegimeCard(
          'Bear Market',
          bearPerformance,
          <TrendingDown className="w-5 h-5 text-red-400" />,
          {
            bg: 'bg-red-500/10',
            border: 'border border-red-400/30',
            text: 'text-red-400'
          }
        )}

        {renderRegimeCard(
          'Sideways Market',
          sidewaysPerformance,
          <Minus className="w-5 h-5 text-blue-400" />,
          {
            bg: 'bg-blue-500/10',
            border: 'border border-blue-400/30',
            text: 'text-blue-400'
          }
        )}
      </div>

      {/* Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        <p className="text-xs text-white/60">
          <strong>Note:</strong> A robust strategy should perform reasonably well across all market regimes.
          Complete failure in any regime is a red flag. Regime classification is based on 20-period price trends.
        </p>
      </div>
    </div>
  );
}
