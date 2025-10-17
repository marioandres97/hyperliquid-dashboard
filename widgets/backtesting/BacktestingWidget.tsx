'use client';

import { useState } from 'react';
import { BacktestConfig, BacktestResult } from './types';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ResultsDashboard } from './components/ResultsDashboard';
import { HyperliquidHistoricalService } from './services/hyperliquidHistorical';
import { DataValidator } from './services/dataValidator';
import { BacktestEngine } from './engine/backtestEngine';
import { AlertCircle, TrendingUp } from 'lucide-react';

export default function BacktestingWidget() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async (config: BacktestConfig) => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      // Fetch market data
      const historicalService = new HyperliquidHistoricalService();
      const marketData = await historicalService.fetchMarketData(
        config.coin,
        config.interval,
        config.startDate.getTime(),
        config.endDate.getTime()
      );

      // Validate data
      const validator = new DataValidator();
      const validation = validator.validateMarketData(marketData);

      if (!validation.valid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        console.warn('Data warnings:', validation.warnings);
      }

      // Run backtest
      const engine = new BacktestEngine(config);
      const backtestResult = await engine.run(validation.validatedData);

      setResult(backtestResult);
    } catch (err) {
      console.error('Backtest error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-400/30">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Day Trading Backtest</h2>
        </div>
        <p className="text-white/70 text-sm">
          Test day trading strategies with conservative cost assumptions. This tool uses real Hyperliquid 
          data and applies strict validation to reject unrealistic strategies.
        </p>
      </div>

      {/* Configuration Panel */}
      <ConfigurationPanel onRunBacktest={handleRunBacktest} isRunning={isRunning} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="text-sm font-bold text-red-400">Backtest Failed</h4>
              <p className="text-sm text-white/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Running Backtest...</h3>
              <p className="text-sm text-white/60">
                Fetching market data, validating, and executing strategy
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isRunning && (
        <ResultsDashboard result={result} />
      )}

      {/* Initial State */}
      {!result && !isRunning && !error && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <div className="max-w-md mx-auto">
            <TrendingUp className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ready to Backtest</h3>
            <p className="text-sm text-white/60">
              Configure your strategy parameters above and click "Run Backtest" to begin.
              The backtest will use real historical data from Hyperliquid DEX with conservative
              cost assumptions.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Available Strategies</div>
                <div className="text-sm font-bold text-white">4</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Assets</div>
                <div className="text-sm font-bold text-white">BTC, ETH, HYPE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-yellow-400 mb-1">Important Disclaimer</h4>
            <p className="text-xs text-white/70">
              <strong>Past performance does not guarantee future results.</strong> This backtesting tool
              uses conservative cost assumptions and strict validation, but cannot predict future market conditions.
              Always practice proper risk management, start with small positions, and never risk more than you can afford to lose.
              Backtests may suffer from look-ahead bias, overfitting, and other limitations. Use this tool for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
