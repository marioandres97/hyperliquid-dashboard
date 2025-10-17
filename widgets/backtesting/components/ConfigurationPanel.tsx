'use client';

import { useState } from 'react';
import { BacktestConfig, DEFAULT_RISK_CONFIG, DEFAULT_COST_CONFIG, StrategyType } from '../types';
import { Play, Settings } from 'lucide-react';

interface ConfigurationPanelProps {
  onRunBacktest: (config: BacktestConfig) => void;
  isRunning: boolean;
}

export function ConfigurationPanel({ onRunBacktest, isRunning }: ConfigurationPanelProps) {
  const [coin, setCoin] = useState('BTC');
  const [strategy, setStrategy] = useState<StrategyType>('fundingRateExtreme');
  const [dateRange, setDateRange] = useState('30');
  const [initialCapital, setInitialCapital] = useState(DEFAULT_RISK_CONFIG.initialCapital);
  const [positionSize, setPositionSize] = useState(DEFAULT_RISK_CONFIG.positionSize);
  const [leverage, setLeverage] = useState(DEFAULT_RISK_CONFIG.leverage);
  const [stopLoss, setStopLoss] = useState(DEFAULT_RISK_CONFIG.stopLoss);
  const [takeProfit, setTakeProfit] = useState(DEFAULT_RISK_CONFIG.takeProfit);
  const [interval, setInterval] = useState<'15m' | '1h' | '4h' | '1d'>('1h');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const config: BacktestConfig = {
      coin,
      startDate,
      endDate,
      strategy,
      riskConfig: {
        initialCapital,
        positionSize,
        leverage,
        stopLoss,
        takeProfit,
        maxPositions: 1
      },
      costConfig: DEFAULT_COST_CONFIG,
      interval
    };

    onRunBacktest(config);
  };

  const strategies = [
    { value: 'fundingRateExtreme', label: 'Funding Rate Extremes', description: 'Mean reversion on extreme funding rates' },
    { value: 'oiExpansion', label: 'OI Expansion + Volume', description: 'Momentum following OI and volume spikes' },
    { value: 'liquidationClusters', label: 'Liquidation Clusters', description: 'Counter-trend after mass liquidations' },
    { value: 'crossAssetCorrelation', label: 'Cross-Asset Correlation', description: 'BTC-ETH correlation breakdown trades' }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Backtest Configuration</h3>
      </div>

      {/* Strategy Selection */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">
          Strategy
        </label>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as StrategyType)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          disabled={isRunning}
        >
          {strategies.map(s => (
            <option key={s.value} value={s.value} className="bg-gray-900">
              {s.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/50 mt-1">
          {strategies.find(s => s.value === strategy)?.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coin Selection */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Asset
          </label>
          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            disabled={isRunning}
          >
            <option value="BTC" className="bg-gray-900">Bitcoin (BTC)</option>
            <option value="ETH" className="bg-gray-900">Ethereum (ETH)</option>
            <option value="HYPE" className="bg-gray-900">Hyperliquid (HYPE)</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Backtest Period
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            disabled={isRunning}
          >
            <option value="30" className="bg-gray-900">Last 30 Days</option>
            <option value="60" className="bg-gray-900">Last 60 Days</option>
            <option value="90" className="bg-gray-900">Last 90 Days</option>
            <option value="180" className="bg-gray-900">Last 180 Days</option>
          </select>
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Timeframe
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value as any)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            disabled={isRunning}
          >
            <option value="15m" className="bg-gray-900">15 Minutes</option>
            <option value="1h" className="bg-gray-900">1 Hour</option>
            <option value="4h" className="bg-gray-900">4 Hours</option>
            <option value="1d" className="bg-gray-900">1 Day</option>
          </select>
        </div>

        {/* Initial Capital */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Initial Capital ($)
          </label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
            min="1000"
            max="1000000"
            step="1000"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Risk Parameters */}
      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-medium text-white/70 mb-3">Risk Parameters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1">
              Position Size (%)
            </label>
            <input
              type="number"
              value={positionSize}
              onChange={(e) => setPositionSize(parseFloat(e.target.value))}
              min="1"
              max="100"
              step="1"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">
              Leverage (x)
            </label>
            <input
              type="number"
              value={leverage}
              onChange={(e) => setLeverage(parseFloat(e.target.value))}
              min="1"
              max="20"
              step="1"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">
              Stop Loss (%)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              min="0.1"
              max="10"
              step="0.1"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              disabled={isRunning}
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">
              Take Profit (%)
            </label>
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
              min="0.1"
              max="20"
              step="0.1"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              disabled={isRunning}
            />
          </div>
        </div>
      </div>

      {/* Run Button */}
      <button
        type="submit"
        disabled={isRunning}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
          isRunning
            ? 'bg-white/10 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/50'
        }`}
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Running Backtest...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            Run Backtest
          </span>
        )}
      </button>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
        <p className="text-xs text-white/70">
          <strong className="text-yellow-400">Note:</strong> This backtest uses conservative cost assumptions 
          (fees x1.5, negative funding bias). Past performance does not guarantee future results.
        </p>
      </div>
    </form>
  );
}
