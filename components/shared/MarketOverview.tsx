'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Coins, Clock } from 'lucide-react';

interface MarketOverviewData {
  totalMarketCap: number;
  sentiment: number; // 0-100 scale (Fear & Greed)
  volume24h: number;
  coinsTracked: number;
  lastUpdate: number;
}

export default function MarketOverview() {
  const [data, setData] = useState<MarketOverviewData>({
    totalMarketCap: 0,
    sentiment: 50,
    volume24h: 0,
    coinsTracked: 3, // BTC, ETH, HYPE
    lastUpdate: Date.now(),
  });

  useEffect(() => {
    // Fetch market overview data
    const fetchMarketData = async () => {
      try {
        // For now, we'll calculate based on the tracked coins
        // In a real implementation, this could call an API endpoint
        setData(prev => ({
          ...prev,
          lastUpdate: Date.now(),
        }));
      } catch (error) {
        console.error('Error fetching market overview:', error);
      }
    };

    fetchMarketData();
    // Update every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 75) return 'Extreme Greed';
    if (sentiment >= 60) return 'Greed';
    if (sentiment >= 40) return 'Neutral';
    if (sentiment >= 25) return 'Fear';
    return 'Extreme Fear';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 60) return 'text-green-400';
    if (sentiment >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const timeSinceUpdate = Math.floor((Date.now() - data.lastUpdate) / 1000);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-white/10" />
      
      {/* Content */}
      <div className="relative z-10 px-4 py-3 md:px-6 md:py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {/* Total Market Cap */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">Market Cap</div>
              <div className="text-sm md:text-base font-bold text-white truncate">
                {data.totalMarketCap > 0 ? formatNumber(data.totalMarketCap) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">Sentiment</div>
              <div className={`text-sm md:text-base font-bold truncate ${getSentimentColor(data.sentiment)}`}>
                {getSentimentLabel(data.sentiment)}
              </div>
            </div>
          </div>

          {/* 24h Volume */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">24h Volume</div>
              <div className="text-sm md:text-base font-bold text-white truncate">
                {data.volume24h > 0 ? formatNumber(data.volume24h) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Coins Tracked */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">Tracked</div>
              <div className="text-sm md:text-base font-bold text-white truncate">
                {data.coinsTracked} coins
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-2 md:gap-3 col-span-2 md:col-span-1">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-white/60" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white/50">Last Update</div>
              <div className="text-sm md:text-base font-bold text-white/80 truncate">
                {timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : `${Math.floor(timeSinceUpdate / 60)}m ago`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
