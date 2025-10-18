'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, DataTable, Column, RealTimeFeed, FeedItem, EducationalTooltip } from '../shared';
import { TrendingUp, TrendingDown, Filter, Zap } from 'lucide-react';
import type { LargeTrade, TradeFilter } from './types';
import { useTrades } from '@/lib/hyperliquid/hooks';

const Module2LargeOrdersFeed: React.FC = () => {
  const { trades: rawTrades, isLoading } = useTrades(100);
  const [trades, setTrades] = useState<LargeTrade[]>([]);
  const [filters, setFilters] = useState<TradeFilter>({
    minSize: 10,
    direction: 'BOTH',
    minPriceImpact: 0.1,
    timeRange: '1h',
  });
  const [showFilters, setShowFilters] = useState(false);
  const previousPricesRef = useRef<Map<string, number>>(new Map());

  // Convert real trades to LargeTrade format and detect cascades
  useEffect(() => {
    if (rawTrades.length === 0) return;

    const convertedTrades: LargeTrade[] = rawTrades.map((trade, index) => {
      // Calculate price impact by comparing with previous price
      const previousPrice = previousPricesRef.current.get(trade.side) || trade.price;
      const priceImpact = Math.abs(((trade.price - previousPrice) / previousPrice) * 100);
      
      previousPricesRef.current.set(trade.side, trade.price);

      // Detect cascade: check if there are multiple large trades in quick succession (within 10 seconds)
      const recentTrades = rawTrades.slice(Math.max(0, index - 5), index);
      const cascadeTrades = recentTrades.filter(t => 
        t.side === trade.side && 
        Math.abs(t.timestamp.getTime() - trade.timestamp.getTime()) < 10000 &&
        t.size >= 10
      );
      const hasCascade = cascadeTrades.length >= 2;

      const largeTrade: LargeTrade = {
        id: `${trade.id}-${trade.timestamp.getTime()}`,
        timestamp: trade.timestamp,
        volume: trade.size,
        priceBefore: previousPrice,
        priceAfter: trade.price,
        priceImpact: priceImpact,
        direction: trade.side,
        cascadeDepth: hasCascade ? cascadeTrades.length + 1 : undefined,
        cascadeVolume: hasCascade ? cascadeTrades.reduce((sum, t) => sum + t.size, trade.size) : undefined,
      };

      // Store large trades in Redis via API (server-side only)
      if (trade.isLarge) {
        // TODO: Create API route for storing trades
        // For now, just log - Redis operations should be server-side only
        console.log('Large trade detected:', largeTrade.id, trade.size);
      }

      return largeTrade;
    });

    setTrades(convertedTrades);
  }, [rawTrades]);

  const filteredTrades = trades.filter(trade => {
    if (trade.volume < filters.minSize) return false;
    if (filters.direction !== 'BOTH' && trade.direction !== filters.direction) return false;
    if (trade.priceImpact < filters.minPriceImpact) return false;
    return true;
  });

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
        <span className="font-mono text-white">{value.toFixed(4)}</span>
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
            <span>{value}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">-</span>
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
          <span className="text-white font-mono">{trade.volume.toFixed(4)} BTC</span>
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

  if (isLoading && trades.length === 0) {
    return (
      <GlassCard variant="purple" padding="md">
        <div className="text-center py-8 text-gray-400">
          Loading real-time trade data...
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Educational Tooltip */}
      <EducationalTooltip
        sections={{
          howToAnalyze: [
            'Órdenes grandes (>10 BTC): Indican movimientos institucionales significativos',
            'Impacto de precio: >1% sugiere baja liquidez o trade muy agresivo',
            'Cascadas (Cascade): Múltiples trades en segundos = posible liquidación forzada',
            'Dirección BUY/SELL: Observa el sesgo institucional dominante',
          ],
          example: 'Si ves 5 trades SELL de >20 BTC con impacto >2% en 10 minutos, los institucionales están descargando posiciones. Prepara salida de LONG o entrada SHORT.',
          tip: 'Presta atención a trades grandes ANTES de noticias importantes - los institucionales suelen posicionarse 1-2 horas antes con información privilegiada.',
        }}
      />

      {/* Header with filters */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-purple-200">Large Orders Real-Time Feed</h2>
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
