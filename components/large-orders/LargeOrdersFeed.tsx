'use client';

import { useState, useEffect } from 'react';
import { useMultiCoinLargeOrders } from '@/lib/hooks/large-orders/useLargeOrders';
import { formatUsdValue, getRelativeTime, downloadCSV } from '@/lib/large-orders/types';
import { Download, TrendingUp } from 'lucide-react';

export function LargeOrdersFeed() {
  const [isMobile, setIsMobile] = useState(false);

  // Show all orders for BTC, ETH, and HYPE without any filtering
  const { largeOrders, allOrders } = useMultiCoinLargeOrders(
    ['BTC', 'ETH', 'HYPE'],
    {
      coin: 'ALL',
      // minSize is not provided - show all orders regardless of size
      side: 'BOTH',
    }
  );

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleExport = () => {
    downloadCSV(allOrders, `large-orders-${Date.now()}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">Large Orders Feed</h2>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-green-400 status-pulse" />
            </div>
            <span className="text-[10px] sm:text-xs text-green-400 font-financial">LIVE</span>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-colors w-full sm:w-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Orders Display - Responsive: Cards on mobile/tablet, Table on desktop */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        {largeOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No large orders detected. Waiting for trades...
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div className="max-h-96 overflow-y-auto space-y-2 p-2">
            {largeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:bg-gray-800/70 transition-colors"
              >
                {/* Top row: Coin + Side badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{order.coin}</span>
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
                  <div className="text-[10px] text-gray-400">
                    {getRelativeTime(order.timestamp)}
                  </div>
                </div>
                
                {/* Price - Large */}
                <div className="text-xl font-bold text-white mb-2">
                  ${order.price.toLocaleString()}
                </div>
                
                {/* Size + USD Value */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Size</div>
                    <div className="text-white font-medium">{order.size.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">USD Value</div>
                    <div className="text-white font-semibold">{formatUsdValue(order.usdValue)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <>
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-7 xl:grid-cols-7 gap-4 px-4 py-3 bg-gray-800/50 border-b border-gray-700 text-xs font-medium text-gray-400">
              <div>Time</div>
              <div>Coin</div>
              <div>Side</div>
              <div className="text-right">Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">USD Value</div>
              <div className="hidden xl:block">Exchange</div>
            </div>

            {/* Tablet Header (hide Exchange) */}
            <div className="grid lg:hidden grid-cols-6 gap-3 px-4 py-3 bg-gray-800/50 border-b border-gray-700 text-xs font-medium text-gray-400">
              <div>Time</div>
              <div>Coin</div>
              <div>Side</div>
              <div className="text-right">Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Value</div>
            </div>

            {/* Table Body - with horizontal scroll protection */}
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <div className="min-w-[800px] lg:min-w-0">
                {largeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-6 lg:grid-cols-7 gap-3 lg:gap-4 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors text-sm"
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
                    <div className="hidden xl:block text-gray-400 text-xs">{order.exchange}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      {largeOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-1 text-[10px] sm:text-xs text-gray-400">
          <span>Showing {largeOrders.length} large orders</span>
          <span>Last 100 trades monitored</span>
        </div>
      )}
    </div>
  );
}
