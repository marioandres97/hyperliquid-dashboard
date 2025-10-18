'use client';

import { useState } from 'react';
import { useOrderBook } from '@/lib/hooks/order-flow/useOrderBook';
import { formatPrice, formatSize, getBarWidth } from '@/lib/order-flow/types';
import type { OrderBookLevel } from '@/lib/order-flow/types';

interface OrderBookRowProps {
  level: OrderBookLevel;
  maxSize: number;
  type: 'bid' | 'ask';
}

function OrderBookRow({ level, maxSize, type }: OrderBookRowProps) {
  const barWidth = getBarWidth(level.size, maxSize);
  const bgColor = type === 'bid' ? 'bg-green-500/20' : 'bg-red-500/20';

  return (
    <div className="relative group">
      {/* Background bar */}
      <div
        className={`absolute inset-y-0 ${type === 'bid' ? 'right-0' : 'left-0'} ${bgColor} transition-all duration-300`}
        style={{ width: `${barWidth}%` }}
      />

      {/* Content */}
      <div className="relative grid grid-cols-2 gap-4 px-3 py-1.5 text-sm">
        <div
          className={`${type === 'bid' ? 'text-green-400' : 'text-red-400'} font-mono`}
        >
          ${formatPrice(level.price)}
        </div>
        <div className="text-right text-gray-300 font-mono">
          {formatSize(level.size)}
        </div>
      </div>
    </div>
  );
}

export function OrderFlowAnalysis() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const { orderBook, connected } = useOrderBook(selectedCoin);

  if (!orderBook) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Order Flow Analysis 📊</h2>
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Loading order book...</p>
        </div>
      </div>
    );
  }

  const maxSize = Math.max(
    ...orderBook.bids.map((b) => b.size),
    ...orderBook.asks.map((a) => a.size)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Order Flow Analysis 📊</h2>
          {connected && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Live</span>
            </div>
          )}
        </div>

        {/* Coin Selector */}
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="HYPE">HYPE</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Best Bid</div>
          <div className="text-lg font-bold text-green-400">
            ${formatPrice(orderBook.bestBid)}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Best Ask</div>
          <div className="text-lg font-bold text-red-400">
            ${formatPrice(orderBook.bestAsk)}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Spread</div>
          <div className="text-lg font-bold text-white">
            ${formatPrice(orderBook.spread)} ({orderBook.spreadPercent.toFixed(3)}%)
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-400">Mid Price</div>
          <div className="text-lg font-bold text-blue-400">
            ${formatPrice(orderBook.midPrice)}
          </div>
        </div>
      </div>

      {/* Order Book */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        {/* Asks (Sell Orders) */}
        <div className="border-b border-gray-800">
          <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-400">
              <div>ASKS (Sell)</div>
              <div className="text-right">Size</div>
            </div>
          </div>
          <div className="space-y-0.5">
            {orderBook.asks.slice(0, 10).reverse().map((ask, index) => (
              <OrderBookRow
                key={`ask-${index}`}
                level={ask}
                maxSize={maxSize}
                type="ask"
              />
            ))}
          </div>
        </div>

        {/* Spread Indicator */}
        <div className="bg-gray-800 py-3 px-3 border-y border-gray-700">
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              ${formatPrice(orderBook.midPrice)}
            </div>
            <div className="text-xs text-gray-400">
              Spread: ${formatPrice(orderBook.spread)} ({orderBook.spreadPercent.toFixed(3)}%)
            </div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div>
          <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-400">
              <div>BIDS (Buy)</div>
              <div className="text-right">Size</div>
            </div>
          </div>
          <div className="space-y-0.5">
            {orderBook.bids.slice(0, 10).map((bid, index) => (
              <OrderBookRow
                key={`bid-${index}`}
                level={bid}
                maxSize={maxSize}
                type="bid"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Imbalance Indicator */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-400 mb-2">Order Book Imbalance</div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-400">BUY: {orderBook.imbalance.bidPercent.toFixed(1)}%</span>
              <span className="text-red-400">SELL: {orderBook.imbalance.askPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${orderBook.imbalance.bidPercent}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${orderBook.imbalance.askPercent}%` }}
              />
            </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-400">Ratio:</div>
            <div className="font-bold text-white">{orderBook.imbalance.ratio.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Volume Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="text-xs text-green-400">Total Bid Volume</div>
          <div className="text-lg font-bold text-green-300">
            {formatSize(orderBook.totalBidVolume, 2)} {selectedCoin}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="text-xs text-red-400">Total Ask Volume</div>
          <div className="text-lg font-bold text-red-300">
            {formatSize(orderBook.totalAskVolume, 2)} {selectedCoin}
          </div>
        </div>
      </div>
    </div>
  );
}
