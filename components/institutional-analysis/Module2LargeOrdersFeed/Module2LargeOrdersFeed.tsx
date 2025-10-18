'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard, DataTable, Column, RealTimeFeed, FeedItem } from '../shared';
import { TrendingUp, TrendingDown, Filter, Zap, Wallet } from 'lucide-react';
import type { LargeTrade, TradeFilter } from './types';
import { useTrades } from '@/lib/hyperliquid/hooks';

const Module2LargeOrdersFeed: React.FC = () => {
  const { trades: rawTrades, isConnected } = useTrades('BTC');
  const [filters, setFilters] = useState<TradeFilter>({
    minSize: 1,
    direction: 'BOTH',
    minPriceImpact: 0.05,
    timeRange: '1h',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{ price: number; timestamp: number }[]>([]);

  // Track price changes to calculate impact
  useEffect(() => {
    if (rawTrades.length > 0) {
      const latestTrade = rawTrades[0];
      setPriceHistory(prev => {
        const updated = [...prev, { price: latestTrade.price, timestamp: latestTrade.timestamp.getTime() }];
        // Keep last 100 price points
        return updated.slice(-100);
      });
    }
  }, [rawTrades]);

  // Convert raw trades to LargeTrade format with calculated price impact
  const trades = useMemo(() => {
    return rawTrades.map((trade, index) => {
      // Calculate price impact by comparing with previous trade
      let priceBefore = trade.price;
      let priceImpact = 0;
      
      if (index < rawTrades.length - 1) {
        priceBefore = rawTrades[index + 1].price;
        priceImpact = Math.abs((trade.price - priceBefore) / priceBefore) * 100;
      }

      // Detect cascades (multiple trades in same direction rapidly)
      let cascadeDepth: number | undefined;
      let cascadeVolume: number | undefined;
      
      if (index > 0 && index < rawTrades.length - 3) {
        const sameDirTrades = rawTrades.slice(index, index + 5).filter(
          t => t.direction === trade.direction && 
          (t.timestamp.getTime() - trade.timestamp.getTime()) < 5000
        );
        
        if (sameDirTrades.length >= 3) {
          cascadeDepth = sameDirTrades.length;
          cascadeVolume = sameDirTrades.reduce((sum, t) => sum + t.value, 0);
        }
      }

      const largeTrade: LargeTrade = {
        id: trade.id,
        timestamp: trade.timestamp,
        volume: trade.volume,
        priceBefore,
        priceAfter: trade.price,
        priceImpact,
        direction: trade.direction,
        cascadeDepth,
        cascadeVolume,
      };

      return largeTrade;
    });
  }, [rawTrades]);

  // Filter trades based on criteria
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      if (trade.volume < filters.minSize) return false;
      if (filters.direction !== 'BOTH' && trade.direction !== filters.direction) return false;
      if (trade.priceImpact < filters.minPriceImpact) return false;
      
      // Filter by time range
      const now = Date.now();
      const tradeTime = trade.timestamp.getTime();
      const timeRanges = {
        '5m': 5 * 60 * 1000,
        '15m': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
      };
      
      if (now - tradeTime > timeRanges[filters.timeRange]) return false;
      
      return true;
    });
  }, [trades, filters]);

  const sortedByImpact = [...filteredTrades].sort((a, b) => b.priceImpact - a.priceImpact);

  const columns: Column<LargeTrade>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      width: '100px',
      render: (value) => (
        <span className="font-mono text-xs text-gray-400">
          {value.toLocaleTimeString()}
        </span>
      ),
    },
    {
      key: 'direction',
      label: 'Side',
      align: 'center',
      width: '80px',
      render: (value) => (
        <span className={`font-bold ${value === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'volume',
      label: 'Volume',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-white">{value.toFixed(2)}</span>
      ),
    },
    {
      key: 'priceBefore',
      label: 'Price Before',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">${value.toFixed(1)}</span>
      ),
    },
    {
      key: 'priceAfter',
      label: 'Price After',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">${value.toFixed(1)}</span>
      ),
    },
    {
      key: 'priceImpact',
      label: 'Impact',
      align: 'right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-1">
          <span className={`font-mono font-bold ${value > 1 ? 'text-yellow-400' : 'text-gray-300'}`}>
            {value.toFixed(2)}%
          </span>
          {row.cascadeDepth && (
            <div title={`Cascade detected: ${row.cascadeDepth} levels`}>
              <Zap size={14} className="text-yellow-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'walletLabel',
      label: 'Wallet',
      render: (value) => (
        value ? (
          <div className="flex items-center gap-1 text-xs text-blue-400">
            <Wallet size={12} />
            <span>{value}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Unknown</span>
        )
      ),
    },
  ];

  const feedItems: FeedItem[] = filteredTrades.slice(0, 20).map(trade => ({
    id: trade.id,
    timestamp: trade.timestamp,
    variant: trade.direction === 'BUY' ? 'success' : 'danger',
    content: (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {trade.direction === 'BUY' ? (
            <TrendingUp className="text-green-400" size={16} />
          ) : (
            <TrendingDown className="text-red-400" size={16} />
          )}
          <span className={`font-bold ${trade.direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
            {trade.direction}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white font-mono">{trade.volume.toFixed(2)} BTC</span>
          <span className="text-gray-400">→</span>
          <span className={`font-bold ${trade.priceImpact > 1 ? 'text-yellow-400' : 'text-gray-300'}`}>
            {trade.priceImpact.toFixed(2)}% impact
          </span>
          {trade.cascadeDepth && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap size={14} />
              <span className="text-xs">Cascade x{trade.cascadeDepth}</span>
            </div>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-purple-200">Large Orders Real-Time Feed</h2>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`} />
              {isConnected ? 'LIVE' : 'DISCONNECTED'}
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              background: showFilters ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            <Filter size={16} />
            <span className="text-sm font-semibold">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 rounded-lg" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Min Size</label>
              <input
                type="number"
                value={filters.minSize}
                onChange={(e) => setFilters({ ...filters, minSize: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Direction</label>
              <select
                value={filters.direction}
                onChange={(e) => setFilters({ ...filters, direction: e.target.value as any })}
                className="w-full px-3 py-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
              >
                <option value="BOTH">Both</option>
                <option value="BUY">Buy Only</option>
                <option value="SELL">Sell Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Min Impact %</label>
              <input
                type="number"
                step="0.1"
                value={filters.minPriceImpact}
                onChange={(e) => setFilters({ ...filters, minPriceImpact: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                className="w-full px-3 py-2 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
              >
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="24h">24 Hours</option>
              </select>
            </div>
          </div>
        )}

        {/* Market Movers Ranking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-purple-300">{filteredTrades.length}</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Buy Pressure</div>
            <div className="text-2xl font-bold text-green-400">
              {((filteredTrades.filter(t => t.direction === 'BUY').length / filteredTrades.length) * 100 || 0).toFixed(0)}%
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Cascades Detected</div>
            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <Zap size={24} />
              {filteredTrades.filter(t => t.cascadeDepth).length}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Live Feed and Execution History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-Time Feed */}
        <GlassCard variant="blue" padding="md">
          <h3 className="text-lg font-bold text-blue-300 mb-4">Live Trade Feed</h3>
          <RealTimeFeed items={feedItems} maxItems={20} autoScroll />
        </GlassCard>

        {/* Top Movers */}
        <GlassCard variant="default" padding="md">
          <h3 className="text-lg font-bold text-gray-200 mb-4">Market Movers (by Impact)</h3>
          <DataTable
            columns={columns.filter(c => ['timestamp', 'direction', 'volume', 'priceImpact'].includes(c.key))}
            data={sortedByImpact.slice(0, 10)}
            keyExtractor={(trade) => trade.id}
            maxHeight="400px"
            stickyHeader={false}
          />
        </GlassCard>
      </div>

      {/* Execution History Table */}
      <GlassCard variant="default" padding="md">
        <h3 className="text-lg font-bold text-gray-200 mb-4">Execution History</h3>
        <DataTable
          columns={columns}
          data={filteredTrades}
          keyExtractor={(trade) => trade.id}
          maxHeight="500px"
        />
      </GlassCard>
    </div>
  );
};

export default Module2LargeOrdersFeed;
