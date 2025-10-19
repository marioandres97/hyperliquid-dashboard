'use client';

import { useState, useEffect } from 'react';
import { usePrices } from './usePrices';
import { useCandleData } from './useCandleData';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import CandlestickChart from '@/components/shared/CandlestickChart';
import ChartFullscreen from '@/components/shared/ChartFullscreen';

const COINS = ['BTC', 'ETH', 'HYPE'];

// Helper to format time since last update
function formatTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();
  const { candles, isLoading, error, retry } = useCandleData();
  const [lastUpdateTimes, setLastUpdateTimes] = useState<Record<string, number>>({});
  const [, forceUpdate] = useState(0);
  // State for controlling which charts are expanded (default: only BTC)
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set(['BTC']));

  // Toggle function for chart expansion
  const toggleChart = (coin: string) => {
    setExpandedCharts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(coin)) {
        newSet.delete(coin);
      } else {
        newSet.add(coin);
      }
      return newSet;
    });
  };

  // Update the last update time when prices change
  useEffect(() => {
    COINS.forEach(coin => {
      if (prices[coin]) {
        setLastUpdateTimes(prev => ({ ...prev, [coin]: Date.now() }));
      }
    });
  }, [prices]);

  // Force re-render every second to update timestamp display
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-3 max-h-[600px] overflow-y-auto">
      {COINS.map(coin => {
        const data = prices[coin];
        const connected = isConnected[coin];
        const isPositive = data?.change24h >= 0;
        const candleData = candles[coin] || [];
        const loading = isLoading[coin];
        const errorMsg = error[coin];
        const lastUpdate = lastUpdateTimes[coin] || Date.now();
        const isExpanded = expandedCharts.has(coin);

        return (
          <div
            key={coin}
            className={`relative bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 border border-white/10 flex flex-col group ${
              isExpanded ? 'flex-1' : 'flex-shrink-0'
            }`}
          >
            {/* Fullscreen button - only show when expanded */}
            {isExpanded && (
              <ChartFullscreen coin={coin}>
                <CandlestickChart data={candleData} height={500} />
              </ChartFullscreen>
            )}

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
                <span className="text-base sm:text-lg font-bold text-white">{coin}</span>
                {/* Expand/Collapse toggle button */}
                <button
                  onClick={() => toggleChart(coin)}
                  className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label={isExpanded ? `Collapse ${coin} chart` : `Expand ${coin} chart`}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/60" />
                  )}
                </button>
              </div>
              
              {/* Connection status indicator */}
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {data ? (
              <>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                  ${data.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                    )}
                    <span className={`text-sm sm:text-base font-medium ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-xs text-white/50">24h</span>
                </div>

                {/* Candlestick Chart - Only show when expanded */}
                {isExpanded && (
                  <div className="mb-3">
                    {errorMsg && (
                      <div className="text-xs text-white/50 mb-1.5 flex items-center justify-end">
                        <button
                          onClick={() => retry(coin)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span className="hidden sm:inline">Retry</span>
                        </button>
                      </div>
                    )}
                    
                    {loading && candleData.length === 0 ? (
                      <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center bg-white/5 rounded-lg animate-pulse">
                        <div className="text-xs text-white/40">Loading chart data...</div>
                      </div>
                    ) : errorMsg ? (
                      <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="text-xs text-red-400 text-center px-4">
                          <div className="mb-2">Failed to load chart</div>
                          <button
                            onClick={() => retry(coin)}
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Click to retry
                          </button>
                        </div>
                      </div>
                    ) : candleData.length > 0 ? (
                      <div className="h-48 sm:h-56 md:h-64">
                        <CandlestickChart data={candleData} height={120} />
                      </div>
                    ) : (
                      <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center bg-white/5 rounded-lg">
                        <div className="text-xs text-white/40">No data available</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Metrics - Only show when expanded */}
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-[10px] sm:text-xs text-white/50 mb-0.5">24h High</div>
                      <div className="text-xs sm:text-sm font-semibold text-green-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="truncate">${(data.price * (1 + Math.abs(data.change24h) / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-[10px] sm:text-xs text-white/50 mb-0.5">24h Low</div>
                      <div className="text-xs sm:text-sm font-semibold text-red-400 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" />
                        <span className="truncate">${(data.price * (1 - Math.abs(data.change24h) / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {connected ? (
                  <div className="text-white/60 text-sm">Loading...</div>
                ) : (
                  <div className="text-center">
                    <div className="text-white/60 mb-2 text-sm">Reconnecting...</div>
                    <div className="text-xs text-white/40">Please wait...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
