'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiCoinLargeOrders } from '@/lib/hooks/large-orders/useLargeOrders';
import { formatUsdValue, getRelativeTime, downloadCSV } from '@/lib/large-orders/types';
import { Download, TrendingUp } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';

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
    <div className="space-y-5">
      {/* Header - Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">Large Orders Feed</h2>
              <div className="flex items-center gap-1.5">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-green-400 font-mono font-semibold">LIVE</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Real-time order flow from BTC, ETH & HYPE</p>
          </div>
        </div>
        <PremiumButton
          onClick={handleExport}
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
        >
          Export CSV
        </PremiumButton>
      </div>

      {/* Orders Display - Bloomberg-Style Premium Table */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl" />
        <div className="absolute inset-0 border border-white/10 rounded-xl" />

        <div className="relative">
          {largeOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-xl mb-4">
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-base font-medium text-gray-400">Waiting for large orders...</p>
              <p className="text-sm text-gray-500 mt-1">Monitoring BTC, ETH & HYPE markets</p>
            </div>
          ) : isMobile ? (
            /* Mobile Card View - Premium */
            <div className="max-h-96 overflow-y-auto p-3 space-y-2">
              <AnimatePresence initial={false}>
                {largeOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className="relative rounded-lg overflow-hidden group"
                  >
                    {/* Card background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm" />
                    <div className="absolute inset-0 border border-white/5 rounded-lg group-hover:border-white/10 transition-colors" />
                    
                    <div className="relative p-3 space-y-2">
                      {/* Top row: Coin + Side badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">{order.coin}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                              order.side === 'BUY'
                                ? 'bg-green-500/20 text-green-400 shadow-sm shadow-green-500/20'
                                : 'bg-red-500/20 text-red-400 shadow-sm shadow-red-500/20'
                            }`}
                          >
                            {order.side}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {getRelativeTime(order.timestamp)}
                        </div>
                      </div>
                      
                      {/* Price - Large, monospace */}
                      <div className="text-xl font-bold text-white font-mono">
                        ${order.price.toLocaleString()}
                      </div>
                      
                      {/* Size + USD Value */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500 mb-0.5">Size</div>
                          <div className="text-white font-mono font-medium">{order.size.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-0.5">USD Value</div>
                          <div className="text-white font-mono font-semibold">{formatUsdValue(order.usdValue)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Desktop Bloomberg-Style Table */
            <>
              {/* Table Header */}
              <div className="grid grid-cols-6 lg:grid-cols-7 gap-4 px-6 py-4 border-b border-white/10">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coin</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Side</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Price</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Size</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">USD Value</div>
                <div className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider">Exchange</div>
              </div>

              {/* Table Body - with smooth scroll */}
              <div className="max-h-96 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {largeOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: index * 0.02 }}
                      className="grid grid-cols-6 lg:grid-cols-7 gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <div className="text-xs text-gray-400 font-mono">
                        {getRelativeTime(order.timestamp)}
                      </div>
                      <div className="text-sm font-bold text-white">{order.coin}</div>
                      <div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
                            order.side === 'BUY'
                              ? 'bg-green-500/20 text-green-400 shadow-sm shadow-green-500/20'
                              : 'bg-red-500/20 text-red-400 shadow-sm shadow-red-500/20'
                          }`}
                        >
                          {order.side}
                        </span>
                      </div>
                      <div className="text-sm text-right text-white font-mono">
                        ${order.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-right text-gray-300 font-mono">
                        {order.size.toFixed(4)}
                      </div>
                      <div className="text-sm text-right font-bold text-white font-mono">
                        {formatUsdValue(order.usdValue)}
                      </div>
                      <div className="hidden lg:block text-xs text-gray-400">{order.exchange}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats - Premium */}
      {largeOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Showing {largeOrders.length} large orders
          </span>
          <span>Last 100 trades monitored</span>
        </div>
      )}
    </div>
  );
}
