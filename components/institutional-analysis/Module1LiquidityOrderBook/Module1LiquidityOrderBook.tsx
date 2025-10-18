'use client';

import React from 'react';
import { GlassCard, DataTable, Column } from '../shared';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useOrderBook } from '@/lib/hyperliquid/hooks';
import { useAsset, formatPrice, formatVolume } from '@/lib/context/AssetContext';

interface OrderBookLevel {
  price: number;
  volume: number;
  accumulated: number;
  distanceFromPrice: number;
  icebergSuspicion?: number;
}

const Module1LiquidityOrderBook: React.FC = () => {
  const { currentAsset } = useAsset();
  const { orderBook, isLoading, error } = useOrderBook(15);

  if (error) {
    return (
      <GlassCard variant="default" padding="lg">
        <div className="text-center text-red-400">
          <p>Error loading order book: {error}</p>
        </div>
      </GlassCard>
    );
  }

  if (isLoading || !orderBook) {
    return (
      <GlassCard variant="default" padding="lg">
        <div className="text-center text-gray-400">
          <Activity className="inline-block animate-spin mb-2" size={24} />
          <p>Loading order book data...</p>
        </div>
      </GlassCard>
    );
  }

  // Calculate volume imbalance
  const totalBidVolume = orderBook.bids.reduce((sum, level) => sum + level.volume, 0);
  const totalAskVolume = orderBook.asks.reduce((sum, level) => sum + level.volume, 0);
  const volumeRatio = totalAskVolume > 0 ? totalBidVolume / totalAskVolume : 0;

  const bidColumns: Column<OrderBookLevel>[] = [
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-green-400">{formatPrice(value, currentAsset)}</span>
          {(row.icebergSuspicion ?? 0) > 0 && (
            <div title={`Iceberg suspicion: ${row.icebergSuspicion}%`}>
              <AlertTriangle size={14} className="text-yellow-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'volume',
      label: 'Volume',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-300">{value.toFixed(4)}</span>
      ),
    },
    {
      key: 'accumulated',
      label: 'Accumulated',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">{value.toFixed(4)}</span>
      ),
    },
    {
      key: 'distanceFromPrice',
      label: 'Distance',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-xs text-gray-500">-{value.toFixed(2)}%</span>
      ),
    },
  ];

  const askColumns: Column<OrderBookLevel>[] = [
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-red-400">{formatPrice(value, currentAsset)}</span>
          {(row.icebergSuspicion ?? 0) > 0 && (
            <div title={`Iceberg suspicion: ${row.icebergSuspicion}%`}>
              <AlertTriangle size={14} className="text-yellow-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'volume',
      label: 'Volume',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-300">{value.toFixed(4)}</span>
      ),
    },
    {
      key: 'accumulated',
      label: 'Accumulated',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">{value.toFixed(4)}</span>
      ),
    },
    {
      key: 'distanceFromPrice',
      label: 'Distance',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-xs text-gray-500">+{value.toFixed(2)}%</span>
      ),
    },
  ];

  const imbalanceColor = volumeRatio > 1.2 ? 'text-green-400' : volumeRatio < 0.8 ? 'text-red-400' : 'text-yellow-400';
  const imbalanceBg = volumeRatio > 1.2 ? 'rgba(16, 185, 129, 0.1)' : volumeRatio < 0.8 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';

  // Count potential iceberg orders (large volume compared to average)
  const avgBidVolume = totalBidVolume / orderBook.bids.length;
  const avgAskVolume = totalAskVolume / orderBook.asks.length;
  const icebergThreshold = 3; // 3x average is suspicious
  const suspiciousBids = orderBook.bids.filter(b => b.volume > avgBidVolume * icebergThreshold).length;
  const suspiciousAsks = orderBook.asks.filter(a => a.volume > avgAskVolume * icebergThreshold).length;

  return (
    <div className="space-y-4">
      {/* Header with metrics */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-purple-200">Real-Time Liquidity & Order Book ({currentAsset})</h2>
          <div className="flex items-center gap-2">
            <Activity className="text-green-400 animate-pulse" size={20} />
            <span className="text-xs text-green-400 font-semibold">LIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Price */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div className="text-sm text-gray-400 mb-1">Mid Price</div>
            <div className="text-2xl font-mono font-bold text-purple-300">
              {formatPrice(orderBook.currentPrice, currentAsset)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Spread: {orderBook.spreadPercent.toFixed(3)}%
            </div>
          </div>

          {/* Volume Imbalance */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: imbalanceBg,
              border: `1px solid ${volumeRatio > 1.2 ? 'rgba(16, 185, 129, 0.3)' : volumeRatio < 0.8 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
          >
            <div className="text-sm text-gray-400 mb-1">Volume Imbalance</div>
            <div className={`text-2xl font-bold ${imbalanceColor} flex items-center gap-2`}>
              {volumeRatio > 1 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              {volumeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Bid: {totalBidVolume.toFixed(2)} / Ask: {totalAskVolume.toFixed(2)}
            </div>
          </div>

          {/* Large Orders Detected */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div className="text-sm text-gray-400 mb-1">Large Orders (3x avg)</div>
            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <AlertTriangle size={24} />
              {suspiciousBids + suspiciousAsks}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Bids: {suspiciousBids} | Asks: {suspiciousAsks}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Order Book Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ask Side (Sell Orders) */}
        <GlassCard variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-red-400" size={20} />
            <h3 className="text-lg font-bold text-red-400">Ask Side (Sell Orders)</h3>
          </div>
          <DataTable
            columns={askColumns}
            data={orderBook.asks}
            keyExtractor={(_, index) => `ask-${index}`}
            maxHeight="400px"
            emptyMessage="No ask orders available"
          />
        </GlassCard>

        {/* Bid Side (Buy Orders) */}
        <GlassCard variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-green-400" size={20} />
            <h3 className="text-lg font-bold text-green-400">Bid Side (Buy Orders)</h3>
          </div>
          <DataTable
            columns={bidColumns}
            data={orderBook.bids}
            keyExtractor={(_, index) => `bid-${index}`}
            maxHeight="400px"
            emptyMessage="No bid orders available"
          />
        </GlassCard>
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center font-mono">
        Last updated: {orderBook.lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Module1LiquidityOrderBook;
