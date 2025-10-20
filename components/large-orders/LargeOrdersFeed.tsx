'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiCoinLargeOrders } from '@/lib/hooks/large-orders/useLargeOrders';
import { formatUsdValue, getRelativeTime, formatPriceImpact, getPriceImpactColor, downloadCSV } from '@/lib/large-orders/types';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { AssetTabs } from './filters/AssetTabs';
import { AssetStatsGrid } from './stats/AssetStatsGrid';
import { SizeRangeSlider } from './filters/SizeRangeSlider';
import { PressureGauge } from './PressureGauge';
import { OrderCard } from './OrderCard';
import { ConnectionStatus } from './ConnectionStatus';
import { useHyperliquidWebSocket } from '@/hooks/useHyperliquidWebSocket';
import { isWhaleOrder, getWhaleStats, playWhaleSound, showWhaleNotification } from '@/lib/large-orders/whale-detection';
import { detectAllWhalePatterns } from '@/lib/large-orders/whale-patterns';
import { WhalePatternsSidebar } from './WhalePatternsSidebar';
import type { CoinFilter, LargeOrder, AssetStats, BuySellPressure } from '@/types/large-orders';
import type { Trade } from '@/lib/hyperliquid/WebSocketManager';
import { tradeToLargeOrder } from '@/lib/large-orders/types';

export function LargeOrdersFeed() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CoinFilter>('ALL');
  const [minSize, setMinSize] = useState(10000);
  const [maxSize, setMaxSize] = useState(10000000);
  const [orders, setOrders] = useState<LargeOrder[]>([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load historical orders on mount
  useEffect(() => {
    async function loadHistoricalOrders() {
      try {
        setIsLoadingHistorical(true);
        const response = await fetch('/api/orders/recent?limit=100&coins=BTC,ETH,HYPE');
        const result = await response.json();
        
        if (result.success && result.data) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error('Failed to load historical orders:', error);
      } finally {
        setIsLoadingHistorical(false);
      }
    }
    
    loadHistoricalOrders();
  }, []);

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

    // Check for whale orders and trigger alerts
    const whaleOrders = newOrders.filter(o => o.isWhale);
    if (whaleOrders.length > 0) {
      whaleOrders.forEach(order => {
        if (soundEnabled) {
          playWhaleSound();
        }
        if (notificationsEnabled) {
          showWhaleNotification(order);
        }
      });
    }

    setOrders((prev) => {
      // Filter out duplicates based on ID
      const existingIds = new Set(prev.map(o => o.id));
      const uniqueNewOrders = newOrders.filter(o => !existingIds.has(o.id));
      
      // Add new orders at the beginning
      const combined = [...uniqueNewOrders, ...prev];
      // Sort by timestamp and keep last 100
      combined.sort((a, b) => b.timestamp - a.timestamp);
      return combined.slice(0, 100);
    });
  }, [soundEnabled, notificationsEnabled]);

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

  // Detect whale patterns
  const whalePatterns = detectAllWhalePatterns(orders);

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
    <div className="space-y-8">
      {/* Header - Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-sm">
            <TrendingUp className="w-6 h-6 text-green-400" />
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Size Range Slider - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/5 border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-6">Order Size Filter</h3>
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

      {/* Main Content: Orders Feed + Whale Patterns Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          {/* Orders Display - Bloomberg-Style Premium Table */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <div className="absolute inset-0 border border-white/5 rounded-3xl" />

            <div className="relative">
          {isLoadingHistorical ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-700/20 to-emerald-800/20 backdrop-blur-xl mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
              </div>
              <p className="text-base font-medium text-gray-300">Loading recent orders...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching BTC, ETH & HYPE markets</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-700/20 to-gray-800/20 backdrop-blur-xl mb-6">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-300">No orders match your filters</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting size range or asset filter</p>
            </div>
          ) : isMobile ? (
            /* Mobile Card View - Premium */
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
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
              <div className="grid grid-cols-8 lg:grid-cols-9 gap-6 px-8 py-5 border-b border-white/5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coin</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Side</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Price</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Size</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">USD Value</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Impact</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
                <div className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider">Exchange</div>
              </div>

              {/* Table Body - with smooth scroll */}
              <div className="max-h-[500px] overflow-y-auto">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={`${order.id}-${order.timestamp}`}
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.95 }}
                      transition={{ 
                        duration: 0.2, 
                        ease: "easeOut",
                        layout: { duration: 0.2 }
                      }}
                      layout
                      className="grid grid-cols-8 lg:grid-cols-9 gap-6 px-8 py-4 border-b border-white/5 hover:bg-white/5 transition-all duration-200 group cursor-pointer hover:scale-[1.01]"
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
                      <div className={`text-xs text-right font-mono ${getPriceImpactColor(order.priceImpact)}`}>
                        {order.priceImpact !== undefined ? (
                          <span className="flex items-center justify-end gap-1">
                            {formatPriceImpact(order.priceImpact)}
                            {order.priceImpact > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : order.priceImpact < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
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

    {/* Whale Patterns Sidebar - Takes 1 column */}
    <div className="lg:col-span-1">
      <WhalePatternsSidebar patterns={whalePatterns} />
    </div>
  </div>
</div>
  );
}
