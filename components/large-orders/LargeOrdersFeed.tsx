'use client';

import { useState } from 'react';
import { useMultiCoinLargeOrders } from '@/lib/hooks/large-orders/useLargeOrders';
import type { CoinFilter, SizeFilter, SideFilter } from '@/lib/large-orders/types';
import { formatUsdValue, getRelativeTime, downloadCSV } from '@/lib/large-orders/types';
import { Download, TrendingUp } from 'lucide-react';

export function LargeOrdersFeed() {
  const [coinFilter, setCoinFilter] = useState<CoinFilter>('ALL');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>(100000);
  const [sideFilter, setSideFilter] = useState<SideFilter>('BOTH');

  const { largeOrders, allOrders } = useMultiCoinLargeOrders(
    ['BTC', 'ETH', 'HYPE'],
    {
      coin: coinFilter,
      minSize: sizeFilter,
      side: sideFilter,
    }
  );

  const handleExport = () => {
    downloadCSV(allOrders, `large-orders-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Large Orders Feed</h2>
          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-green-400 status-pulse" />
            </div>
            <span className="text-xs text-green-400 font-financial">LIVE</span>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Coin Filter */}
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 self-center">Coin:</span>
          {(['BTC', 'ETH', 'HYPE', 'ALL'] as CoinFilter[]).map((coin) => (
            <button
              key={coin}
              onClick={() => setCoinFilter(coin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                coinFilter === coin
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {coin}
            </button>
          ))}
        </div>

        {/* Size Filter */}
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 self-center">Min Size:</span>
          {[
            { value: 100000, label: '>$100K' },
            { value: 250000, label: '>$250K' },
            { value: 500000, label: '>$500K' },
            { value: 1000000, label: '>$1M' },
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => setSizeFilter(size.value as SizeFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sizeFilter === size.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>

        {/* Side Filter */}
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 self-center">Side:</span>
          {(['BUY', 'SELL', 'BOTH'] as SideFilter[]).map((side) => (
            <button
              key={side}
              onClick={() => setSideFilter(side)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sideFilter === side
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {side}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-800/50 border-b border-gray-700 text-xs font-medium text-gray-400">
          <div>Time</div>
          <div>Coin</div>
          <div>Side</div>
          <div className="text-right">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">USD Value</div>
          <div>Exchange</div>
        </div>

        {/* Table Body */}
        <div className="max-h-96 overflow-y-auto">
          {largeOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No large orders detected. Waiting for trades...
            </div>
          ) : (
            largeOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors text-sm"
              >
                <div className="text-gray-400 text-xs">
                  {getRelativeTime(order.timestamp)}
                </div>
                <div className="font-medium text-white">{order.coin}</div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      order.side === 'BUY'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {order.side}
                  </span>
                </div>
                <div className="text-right text-white">
                  ${order.price.toLocaleString()}
                </div>
                <div className="text-right text-gray-300">
                  {order.size.toFixed(4)}
                </div>
                <div className="text-right font-semibold text-white">
                  {formatUsdValue(order.usdValue)}
                </div>
                <div className="text-gray-400 text-xs">{order.exchange}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      {largeOrders.length > 0 && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Showing {largeOrders.length} large orders</span>
          <span>Last 100 trades monitored</span>
        </div>
      )}
    </div>
  );
}
