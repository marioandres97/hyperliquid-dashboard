'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiCoinLargeOrders } from '@/lib/hooks/large-orders/useLargeOrders';
import { formatUsdValue, getRelativeTime, downloadCSV } from '@/lib/large-orders/types';
import { Download, TrendingUp } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { AssetTabs } from './filters/AssetTabs';
import { AssetStatsGrid } from './stats/AssetStatsGrid';
import { SizeRangeSlider } from './filters/SizeRangeSlider';
import { PressureGauge } from './PressureGauge';
import { OrderCard } from './OrderCard';
import { ConnectionStatus } from './ConnectionStatus';
import { useHyperliquidWebSocket } from '@/hooks/useHyperliquidWebSocket';
import { isWhaleOrder, getWhaleStats } from '@/lib/large-orders/whale-detection';
import type { CoinFilter, LargeOrder, AssetStats, BuySellPressure } from '@/types/large-orders';
import type { Trade } from '@/lib/hyperliquid/WebSocketManager';
import { tradeToLargeOrder } from '@/lib/large-orders/types';

export function LargeOrdersFeed() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CoinFilter>('ALL');
  const [minSize, setMinSize] = useState(10000);
  const [maxSize, setMaxSize] = useState(10000000);
  const [orders, setOrders] = useState<LargeOrder[]>([]);

  // WebSocket integration - use useCallback to prevent re-renders
  const handleTrades = useCallback((coin: string, trades: Trade[]) => {
    if (!trades || trades.length === 0) return;
    
    const newOrders: LargeOrder[] = trades.map((trade) => {
      const order = tradeToLargeOrder(trade, coin);
      return {
        ...order,
        isWhale: isWhaleOrder(order.usdValue),
      };
    });

    setOrders((prev) => {
      const combined = [...newOrders, ...prev];
      // Sort by timestamp and keep last 100
      combined.sort((a, b) => b.timestamp - a.timestamp);
      return combined.slice(0, 100);
    });
  }, []);

  const { connectionState, reconnect } = useHyperliquidWebSocket(
    ['BTC', 'ETH', 'HYPE'],
    handleTrades
  );

  // Filter orders based on selections
  const filteredOrders = orders.filter((order) => {
    if (selectedAsset !== 'ALL' && order.coin !== selectedAsset) return false;
    if (order.usdValue < minSize || order.usdValue > maxSize) return false;
    return true;
  });

  // Calculate buy/sell pressure
  const buyVolume = filteredOrders
    .filter((o) => o.side === 'BUY')
    .reduce((sum, o) => sum + o.usdValue, 0);
  const sellVolume = filteredOrders
    .filter((o) => o.side === 'SELL')
    .reduce((sum, o) => sum + o.usdValue, 0);
  
  // Calculate ratio - handle edge cases properly
  let ratio = 1;
  if (buyVolume > 0 && sellVolume > 0) {
    ratio = buyVolume / sellVolume;
  } else if (buyVolume > 0 && sellVolume === 0) {
    ratio = 10; // Very high ratio to indicate extreme bullish pressure
  } else if (buyVolume === 0 && sellVolume > 0) {
    ratio = 0.1; // Very low ratio to indicate extreme bearish pressure
  }
  
  const pressure: BuySellPressure = {
    buyVolume,
    sellVolume,
    ratio,
    trend: ratio > 1.2 ? 'bullish' : ratio < 0.8 ? 'bearish' : 'neutral',
  };

  // Mock asset stats (in production, these would come from API)
  const assetStats: AssetStats = {
    marketCap: selectedAsset === 'BTC' ? '$1.2T' : selectedAsset === 'ETH' ? '$480B' : '$2.5B',
    volume24h: `$${(filteredOrders.reduce((sum, o) => sum + o.usdValue, 0) / 1000000).toFixed(1)}M`,
    openInterest: selectedAsset === 'BTC' ? '$45.2B' : selectedAsset === 'ETH' ? '$18.5B' : '$850M',
  };

  // Get whale stats
  const whaleStats = getWhaleStats(filteredOrders);

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
    downloadCSV(filteredOrders, `large-orders-${Date.now()}.csv`);
  };

  const handleRangeChange = (min: number, max: number) => {
    setMinSize(min);
    setMaxSize(max);
  };

  return (
    <div className="space-y-6">
      {/* Header - Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">Large Orders Feed</h2>
              <ConnectionStatus connectionState={connectionState} onReconnect={reconnect} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Institutional-grade order flow monitor</p>
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

      {/* Asset Filter Tabs */}
      <AssetTabs
        selectedAsset={selectedAsset}
        onAssetChange={setSelectedAsset}
        orderCounts={{
          ALL: orders.length,
          BTC: orders.filter((o) => o.coin === 'BTC').length,
          ETH: orders.filter((o) => o.coin === 'ETH').length,
          HYPE: orders.filter((o) => o.coin === 'HYPE').length,
        }}
      />

      {/* Asset Stats Grid */}
      <AssetStatsGrid asset={selectedAsset} stats={assetStats} />

      {/* Filters and Pressure Gauge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Size Range Slider - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Order Size Filter</h3>
            <SizeRangeSlider
              minSize={minSize}
              maxSize={maxSize}
              onRangeChange={handleRangeChange}
            />
          </div>
        </div>

        {/* Pressure Gauge - Takes 1 column */}
        <div className="lg:col-span-1">
          <PressureGauge pressure={pressure} />
        </div>
      </div>

      {/* Orders Display - Bloomberg-Style Premium Table */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl" />
        <div className="absolute inset-0 border border-white/10 rounded-xl" />

        <div className="relative">
          {filteredOrders.length === 0 ? (
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
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredOrders.map((order, index) => (
                  <OrderCard key={`${order.id}-${order.timestamp}`} order={order} index={index} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Desktop Bloomberg-Style Table */
            <>
              {/* Table Header */}
              <div className="grid grid-cols-7 lg:grid-cols-8 gap-4 px-6 py-4 border-b border-white/10">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coin</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Side</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Price</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Size</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">USD Value</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
                <div className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider">Exchange</div>
              </div>

              {/* Table Body - with smooth scroll */}
              <div className="max-h-96 overflow-y-auto">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={`${order.id}-${order.timestamp}`}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-7 lg:grid-cols-8 gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
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
                      <div className="flex items-center">
                        {order.isWhale && <span className="text-lg">🐋</span>}
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
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Showing {filteredOrders.length} orders
            </span>
            <span>🐋 {whaleStats.count} whales detected</span>
          </div>
          <span>Last 100 trades monitored</span>
        </div>
      )}
    </div>
  );
}
