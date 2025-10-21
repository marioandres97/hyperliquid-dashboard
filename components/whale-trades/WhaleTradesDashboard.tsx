/**
 * Example Component: Whale Trades Dashboard
 * 
 * This component demonstrates how to use the whale trade tracking system.
 * It shows recent whale trades, statistics, and provides filtering options.
 */

'use client';

import { useState } from 'react';
import { useWhaleTrades, useWhaleTradeStats, useWhaleThresholds } from '@/hooks/useWhaleTrades';
import { WhaleTradeCategory } from '@/lib/database/repositories/whaleTrade.repository';

export function WhaleTradesDashboard() {
  const [selectedAsset, setSelectedAsset] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<WhaleTradeCategory | undefined>();
  const [hours, setHours] = useState(24);

  // Fetch whale trades with filters
  const { trades, loading, error, getRecent } = useWhaleTrades({
    asset: selectedAsset,
    category: selectedCategory,
    hours,
    limit: 50,
  });

  // Fetch statistics
  const { stats } = useWhaleTradeStats({
    asset: selectedAsset,
  });

  // Fetch thresholds
  const { thresholds } = useWhaleThresholds();

  const handleRefresh = () => {
    getRecent(hours, 50);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading whale trades...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🐋 Whale Trades</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {/* Thresholds Info */}
      {thresholds && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Thresholds</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(thresholds.assetThresholds).map(([asset, threshold]) => (
              <div key={asset} className="text-sm">
                <span className="text-gray-400">{asset}:</span>
                <span className="text-white ml-2">${(threshold / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Trades</div>
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Volume</div>
            <div className="text-2xl font-bold text-white">
              ${(stats.totalVolume / 1000000).toFixed(2)}M
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Buy / Sell</div>
            <div className="text-2xl font-bold">
              <span className="text-green-400">{stats.buyCount}</span>
              <span className="text-gray-400"> / </span>
              <span className="text-red-400">{stats.sellCount}</span>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Avg Trade Size</div>
            <div className="text-2xl font-bold text-white">
              ${(stats.avgTradeSize / 1000).toFixed(1)}K
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedAsset || ''}
          onChange={(e) => setSelectedAsset(e.target.value || undefined)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="">All Assets</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="SOL">SOL</option>
        </select>

        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value as WhaleTradeCategory || undefined)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="">All Categories</option>
          <option value="MEGA_WHALE">🐋🐋 Mega Whale ($1M+)</option>
          <option value="WHALE">🐋 Whale ($100k+)</option>
          <option value="INSTITUTION">🏦 Institution ($50k+)</option>
          <option value="LARGE">💰 Large ($10k+)</option>
        </select>

        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="1">Last Hour</option>
          <option value="6">Last 6 Hours</option>
          <option value="24">Last 24 Hours</option>
          <option value="168">Last Week</option>
        </select>
      </div>

      {/* Trades List */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-medium">Time</th>
                <th className="text-left p-4 text-gray-400 font-medium">Asset</th>
                <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                <th className="text-left p-4 text-gray-400 font-medium">Side</th>
                <th className="text-right p-4 text-gray-400 font-medium">Price</th>
                <th className="text-right p-4 text-gray-400 font-medium">Size</th>
                <th className="text-right p-4 text-gray-400 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-400">
                    No whale trades found
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300 text-sm">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4 text-white font-medium">{trade.asset}</td>
                    <td className="p-4">
                      <span className={getCategoryBadgeClass(trade.category)}>
                        {getCategoryEmoji(trade.category)} {trade.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      ${trade.price.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      {trade.size.toFixed(4)}
                    </td>
                    <td className="p-4 text-right text-white font-medium">
                      ${formatValue(trade.notionalValue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryEmoji(category: WhaleTradeCategory): string {
  switch (category) {
    case WhaleTradeCategory.MEGA_WHALE:
      return '🐋🐋';
    case WhaleTradeCategory.WHALE:
      return '🐋';
    case WhaleTradeCategory.INSTITUTION:
      return '🏦';
    case WhaleTradeCategory.LARGE:
      return '💰';
    default:
      return '📊';
  }
}

function getCategoryBadgeClass(category: WhaleTradeCategory): string {
  const baseClass = 'px-2 py-1 rounded text-xs font-medium';
  switch (category) {
    case WhaleTradeCategory.MEGA_WHALE:
      return `${baseClass} bg-purple-500/20 text-purple-300`;
    case WhaleTradeCategory.WHALE:
      return `${baseClass} bg-blue-500/20 text-blue-300`;
    case WhaleTradeCategory.INSTITUTION:
      return `${baseClass} bg-yellow-500/20 text-yellow-300`;
    case WhaleTradeCategory.LARGE:
      return `${baseClass} bg-green-500/20 text-green-300`;
    default:
      return `${baseClass} bg-gray-500/20 text-gray-300`;
  }
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
