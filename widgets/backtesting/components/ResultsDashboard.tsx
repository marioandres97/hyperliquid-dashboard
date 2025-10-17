'use client';

import { BacktestResult } from '../types';
import { MetricsGrid } from './MetricsGrid';
import { EquityCurveChart } from './EquityCurveChart';
import { ValidationAlerts } from './ValidationAlerts';
import { RegimeAnalysis } from './RegimeAnalysis';
import { TradesTable } from './TradesTable';
import { Download, FileJson, FileText } from 'lucide-react';

interface ResultsDashboardProps {
  result: BacktestResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      'ID', 'Side', 'Entry Price', 'Exit Price', 'Entry Time', 'Exit Time',
      'Size', 'Leverage', 'PnL', 'PnL %', 'Fees', 'Slippage', 'Funding',
      'Total Cost', 'Holding Time', 'Exit Reason'
    ];

    const rows = result.trades.map(trade => [
      trade.id,
      trade.side,
      trade.entryPrice,
      trade.exitPrice,
      new Date(trade.entryTime).toISOString(),
      new Date(trade.exitTime).toISOString(),
      trade.size,
      trade.leverage,
      trade.pnl,
      trade.pnlPercent,
      trade.fees,
      trade.slippage,
      trade.funding,
      trade.totalCost,
      trade.holdingTime,
      trade.exitReason
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest-${result.config.coin}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    // Create JSON export
    const jsonContent = JSON.stringify({
      config: result.config,
      metrics: result.metrics,
      trades: result.trades,
      validation: result.validation,
      duration: result.duration
    }, null, 2);

    // Download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest-${result.config.coin}-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Backtest Results</h2>
          <p className="text-sm text-white/60 mt-1">
            {result.config.coin} • {result.config.strategy} • 
            {new Date(result.config.startDate).toLocaleDateString()} - {new Date(result.config.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
          >
            <FileText className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <ValidationAlerts validation={result.validation} />

      {/* Metrics Grid */}
      <MetricsGrid metrics={result.metrics} />

      {/* Equity Curve */}
      <EquityCurveChart 
        equityCurve={result.equityCurve} 
        initialCapital={result.config.riskConfig.initialCapital} 
      />

      {/* Regime Analysis */}
      <RegimeAnalysis
        bullPerformance={result.metrics.bullPerformance}
        bearPerformance={result.metrics.bearPerformance}
        sidewaysPerformance={result.metrics.sidewaysPerformance}
      />

      {/* Win/Loss Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
          <h4 className="text-sm font-bold text-green-400 mb-3">Winning Trades</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-white/60">Average Win</span>
              <span className="text-sm font-bold text-green-400">
                +${result.metrics.avgWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-white/60">Largest Win</span>
              <span className="text-sm font-bold text-green-400">
                +${result.metrics.largestWin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-white/60">Win Streak</span>
              <span className="text-sm font-bold text-white">
                {result.metrics.winStreak} trades
              </span>
            </div>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
          <h4 className="text-sm font-bold text-red-400 mb-3">Losing Trades</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-white/60">Average Loss</span>
              <span className="text-sm font-bold text-red-400">
                -${result.metrics.avgLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-white/60">Largest Loss</span>
              <span className="text-sm font-bold text-red-400">
                -${result.metrics.largestLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-white/60">Loss Streak</span>
              <span className="text-sm font-bold text-white">
                {result.metrics.lossStreak} trades
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-3">Cost Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-white/60">Total Fees</span>
            <div className="text-lg font-bold text-orange-400">
              ${result.metrics.totalFees.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-xs text-white/60">Total Slippage</span>
            <div className="text-lg font-bold text-orange-400">
              ${result.metrics.totalSlippage.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-xs text-white/60">Total Funding</span>
            <div className="text-lg font-bold text-orange-400">
              ${result.metrics.totalFunding.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-xs text-white/60">Total Costs</span>
            <div className="text-lg font-bold text-red-400">
              ${result.metrics.totalCosts.toFixed(2)}
            </div>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-3">
          Costs include conservative multipliers (fees x{result.config.costConfig.feeMultiplier}).
          This represents a worst-case scenario for realistic expectations.
        </p>
      </div>

      {/* Trades Table */}
      <TradesTable trades={result.trades} />

      {/* Performance Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-2">Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-white/60">Calmar Ratio</span>
            <div className="font-bold text-white">{result.metrics.calmarRatio.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-white/60">Max DD Duration</span>
            <div className="font-bold text-white">{result.metrics.maxDrawdownDuration.toFixed(1)} days</div>
          </div>
          <div>
            <span className="text-white/60">Avg Win %</span>
            <div className="font-bold text-green-400">+{result.metrics.avgWinPercent.toFixed(2)}%</div>
          </div>
          <div>
            <span className="text-white/60">Avg Loss %</span>
            <div className="font-bold text-red-400">-{result.metrics.avgLossPercent.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* Execution Time */}
      <div className="text-center text-xs text-white/50">
        Backtest completed in {result.duration}ms
      </div>
    </div>
  );
}
