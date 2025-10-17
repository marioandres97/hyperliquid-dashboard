'use client';

import { BacktestMetrics } from '../types';
import { TrendingUp, TrendingDown, Target, Award, DollarSign, Clock, Zap, AlertCircle } from 'lucide-react';

interface MetricsGridProps {
  metrics: BacktestMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const isProfitable = metrics.totalPnL >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total PnL */}
      <div className={`p-4 rounded-xl border-2 ${
        isProfitable 
          ? 'bg-green-500/10 border-green-400/30' 
          : 'bg-red-500/10 border-red-400/30'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">Total PnL</span>
        </div>
        <div className={`text-2xl font-bold ${
          isProfitable ? 'text-green-400' : 'text-red-400'
        }`}>
          {isProfitable ? '+' : ''}${metrics.totalPnL.toFixed(2)}
        </div>
        <div className="text-xs text-white/50 mt-1">
          {isProfitable ? '+' : ''}{metrics.totalPnLPercent.toFixed(2)}%
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">Win Rate</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {(metrics.winRate * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-white/50 mt-1">
          {metrics.winningTrades}W / {metrics.losingTrades}L
        </div>
      </div>

      {/* Sharpe Ratio */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">Sharpe Ratio</span>
        </div>
        <div className={`text-2xl font-bold ${
          metrics.sharpeRatio > 2 ? 'text-green-400' : 
          metrics.sharpeRatio > 1 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {metrics.sharpeRatio.toFixed(2)}
        </div>
        <div className="text-xs text-white/50 mt-1">
          Sortino: {metrics.sortinoRatio.toFixed(2)}
        </div>
      </div>

      {/* Max Drawdown */}
      <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-xs text-white/60">Max Drawdown</span>
        </div>
        <div className="text-2xl font-bold text-red-400">
          -{(metrics.maxDrawdownPercent * 100).toFixed(1)}%
        </div>
        <div className="text-xs text-white/50 mt-1">
          ${metrics.maxDrawdown.toFixed(2)}
        </div>
      </div>

      {/* Profit Factor */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">Profit Factor</span>
        </div>
        <div className={`text-2xl font-bold ${
          metrics.profitFactor > 2 ? 'text-green-400' : 
          metrics.profitFactor > 1.5 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {metrics.profitFactor > 100 ? '∞' : metrics.profitFactor.toFixed(2)}
        </div>
        <div className="text-xs text-white/50 mt-1">
          RR: {metrics.riskRewardRatio.toFixed(2)}
        </div>
      </div>

      {/* Total Trades */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">Total Trades</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {metrics.totalTrades}
        </div>
        <div className="text-xs text-white/50 mt-1">
          Expectancy: ${metrics.expectancy.toFixed(2)}
        </div>
      </div>

      {/* Avg Holding Time */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60">Avg Hold Time</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {metrics.avgHoldingTime.toFixed(1)}h
        </div>
        <div className="text-xs text-white/50 mt-1">
          {(metrics.avgHoldingTime / 24).toFixed(1)} days
        </div>
      </div>

      {/* Total Costs */}
      <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-white/60">Total Costs</span>
        </div>
        <div className="text-2xl font-bold text-orange-400">
          ${metrics.totalCosts.toFixed(2)}
        </div>
        <div className="text-xs text-white/50 mt-1">
          Fees: ${metrics.totalFees.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
