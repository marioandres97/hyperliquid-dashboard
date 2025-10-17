'use client';

import { usePnLTracking } from './usePnLTracking';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PnLTrackerWidget() {
  const { stats, isLoading } = usePnLTracking();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">Loading PnL...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">No trading data yet</p>
      </div>
    );
  }

  const isProfitable = stats.totalPnL >= 0;

  // Format equity curve data for chart
  const chartData = stats.equityCurve.map(point => ({
    time: new Date(point.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    equity: point.equity,
    pnl: point.pnl
  }));

  return (
    <div className="space-y-4">
      {/* Total PnL */}
      <div className={`p-4 rounded-xl border-2 ${
        isProfitable 
          ? 'bg-green-500/10 border-green-400' 
          : 'bg-red-500/10 border-red-400'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-white/60" />
          <span className="text-sm text-white/60">Total PnL</span>
        </div>
        <div className={`text-3xl font-bold ${
          isProfitable ? 'text-green-400' : 'text-red-400'
        }`}>
          {isProfitable ? '+' : ''}${stats.totalPnL.toFixed(2)}
        </div>
      </div>

      {/* Equity Curve */}
      {chartData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-white/70 mb-3">Equity Curve</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff40"
                tick={{ fill: '#ffffff60', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#ffffff40"
                tick={{ fill: '#ffffff60', fontSize: 12 }}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
              />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* LONG/SHORT Win Rates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">LONG Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {stats.bySignalType.LONG.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50 mt-1">
            {stats.bySignalType.LONG.winningTrades}W / {stats.bySignalType.LONG.losingTrades}L
          </div>
          <div className={`text-xs font-medium mt-1 ${
            stats.bySignalType.LONG.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            PnL: {stats.bySignalType.LONG.totalPnL >= 0 ? '+' : ''}${stats.bySignalType.LONG.totalPnL.toFixed(2)}
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <span className="text-xs text-white/60">SHORT Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {stats.bySignalType.SHORT.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50 mt-1">
            {stats.bySignalType.SHORT.winningTrades}W / {stats.bySignalType.SHORT.losingTrades}L
          </div>
          <div className={`text-xs font-medium mt-1 ${
            stats.bySignalType.SHORT.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            PnL: {stats.bySignalType.SHORT.totalPnL >= 0 ? '+' : ''}${stats.bySignalType.SHORT.totalPnL.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Timeframe PnL */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50 mb-1">Today</div>
          <div className={`text-lg font-bold ${
            stats.byTimeframe.today >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.byTimeframe.today >= 0 ? '+' : ''}${stats.byTimeframe.today.toFixed(2)}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50 mb-1">Week</div>
          <div className={`text-lg font-bold ${
            stats.byTimeframe.week >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.byTimeframe.week >= 0 ? '+' : ''}${stats.byTimeframe.week.toFixed(2)}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/50 mb-1">Month</div>
          <div className={`text-lg font-bold ${
            stats.byTimeframe.month >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.byTimeframe.month >= 0 ? '+' : ''}${stats.byTimeframe.month.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Win Rate & Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/50">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-white/50 mt-1">
            {stats.winningTrades}W / {stats.losingTrades}L
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/50">Profit Factor</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.profitFactor > 100 ? '∞' : stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-xs text-white/50 mt-1">
            {stats.totalTrades} trades
          </div>
        </div>
      </div>

      {/* Avg Win/Loss */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">Avg Win</span>
          </div>
          <div className="text-xl font-bold text-green-400">
            +${stats.avgWin.toFixed(2)}
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-white/60">Avg Loss</span>
          </div>
          <div className="text-xl font-bold text-red-400">
            -${stats.avgLoss.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Largest Win/Loss */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-white/50 mb-1">Largest Win</div>
            <div className="text-lg font-bold text-green-400">
              +${stats.largestWin.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50 mb-1">Largest Loss</div>
            <div className="text-lg font-bold text-red-400">
              ${stats.largestLoss.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
