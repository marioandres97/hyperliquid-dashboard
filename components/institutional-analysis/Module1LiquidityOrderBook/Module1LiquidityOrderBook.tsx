'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, DataTable, Column, EducationalTooltip } from '../shared';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { OrderBookLevel, OrderBookData, VolumeImbalance } from './types';

// Mock data generator for demonstration
const generateMockOrderBook = (currentPrice: number): OrderBookData => {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  
  let accumulatedBid = 0;
  let accumulatedAsk = 0;
  
  // Generate 15 bid levels
  for (let i = 0; i < 15; i++) {
    const price = currentPrice - (i + 1) * 50;
    const volume = Math.random() * 5 + 1;
    accumulatedBid += volume;
    bids.push({
      price,
      volume,
      accumulated: accumulatedBid,
      distanceFromPrice: ((currentPrice - price) / currentPrice) * 100,
      icebergSuspicion: Math.random() > 0.85 ? Math.floor(Math.random() * 40 + 60) : 0,
    });
  }
  
  // Generate 15 ask levels
  for (let i = 0; i < 15; i++) {
    const price = currentPrice + (i + 1) * 50;
    const volume = Math.random() * 5 + 1;
    accumulatedAsk += volume;
    asks.push({
      price,
      volume,
      accumulated: accumulatedAsk,
      distanceFromPrice: ((price - currentPrice) / currentPrice) * 100,
      icebergSuspicion: Math.random() > 0.85 ? Math.floor(Math.random() * 40 + 60) : 0,
    });
  }
  
  return {
    bids,
    asks,
    currentPrice,
    lastUpdate: new Date(),
  };
};

const Module1LiquidityOrderBook: React.FC = () => {
  const [orderBook, setOrderBook] = useState<OrderBookData>(
    generateMockOrderBook(97500)
  );
  const [volumeImbalance, setVolumeImbalance] = useState<VolumeImbalance>({
    buyVolume: 0,
    sellVolume: 0,
    ratio: 0,
    timestamp: new Date(),
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newPrice = 97500 + (Math.random() - 0.5) * 1000;
      setOrderBook(generateMockOrderBook(newPrice));
      
      // Calculate volume imbalance
      const buyVol = Math.random() * 100 + 50;
      const sellVol = Math.random() * 100 + 50;
      setVolumeImbalance({
        buyVolume: buyVol,
        sellVolume: sellVol,
        ratio: buyVol / sellVol,
        timestamp: new Date(),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const bidColumns: Column<OrderBookLevel>[] = [
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-green-400">${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
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
        <span className="font-mono text-gray-300">{value.toFixed(2)}</span>
      ),
    },
    {
      key: 'accumulated',
      label: 'Accumulated',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">{value.toFixed(2)}</span>
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
          <span className="font-mono text-red-400">${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
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
        <span className="font-mono text-gray-300">{value.toFixed(2)}</span>
      ),
    },
    {
      key: 'accumulated',
      label: 'Accumulated',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">{value.toFixed(2)}</span>
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

  const imbalanceColor = volumeImbalance.ratio > 1.2 ? 'text-green-400' : volumeImbalance.ratio < 0.8 ? 'text-red-400' : 'text-yellow-400';
  const imbalanceBg = volumeImbalance.ratio > 1.2 ? 'rgba(16, 185, 129, 0.1)' : volumeImbalance.ratio < 0.8 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';

  return (
    <div className="space-y-4">
      {/* Header with metrics */}
      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-purple-200">Real-Time Liquidity & Order Book</h2>
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
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-2xl font-mono font-bold text-purple-300">
              ${orderBook.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1 })}
            </div>
          </div>

          {/* Volume Imbalance */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: imbalanceBg,
              border: `1px solid ${volumeImbalance.ratio > 1.2 ? 'rgba(16, 185, 129, 0.3)' : volumeImbalance.ratio < 0.8 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
          >
            <div className="text-sm text-gray-400 mb-1">Volume Imbalance (5m)</div>
            <div className={`text-2xl font-bold ${imbalanceColor} flex items-center gap-2`}>
              {volumeImbalance.ratio > 1 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              {volumeImbalance.ratio.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Buy: {volumeImbalance.buyVolume.toFixed(1)} / Sell: {volumeImbalance.sellVolume.toFixed(1)}
            </div>
          </div>

          {/* Iceberg Orders Detected */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div className="text-sm text-gray-400 mb-1">Iceberg Orders</div>
            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <AlertTriangle size={24} />
              {orderBook.bids.filter(b => (b.icebergSuspicion ?? 0) > 0).length + orderBook.asks.filter(a => (a.icebergSuspicion ?? 0) > 0).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Suspected patterns detected</div>
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

      {/* Educational Tooltip */}
      <EducationalTooltip
        title="Cómo Entender el Libro de Órdenes"
        content={
          <div>
            <p className="mb-3">
              El <strong>libro de órdenes</strong> muestra todas las órdenes de compra (bids) y venta (asks) activas en el mercado. 
              Los traders institucionales utilizan esta información para detectar niveles de liquidez y posibles manipulaciones.
            </p>
            <p className="mb-3">
              <strong>Volume Imbalance:</strong> Cuando hay más volumen de compra que de venta (ratio &gt; 1.2), 
              indica presión alcista. Un ratio &lt; 0.8 indica presión bajista.
            </p>
            <p>
              <strong>Iceberg Orders:</strong> Órdenes grandes ocultas que solo muestran una parte pequeña. 
              Los detectamos cuando vemos reemplazos constantes al mismo precio.
            </p>
          </div>
        }
        examples={[
          'Si ves un ratio de 1.5, significa que hay 50% más compradores que vendedores activos.',
          'Una orden iceberg de 100 BTC puede mostrar solo 5 BTC en el libro, reemplazándose continuamente.',
          'Un muro de órdenes grandes en un nivel puede ser falso si desaparece cuando el precio se acerca.',
        ]}
        tips={[
          'Observa los niveles con mayor volumen acumulado - suelen actuar como soporte/resistencia.',
          'Los iceberg orders indican posiciones institucionales grandes.',
          'Un desequilibrio alto no garantiza movimiento - puede ser trampa para retail traders.',
        ]}
      />
    </div>
  );
};

export default Module1LiquidityOrderBook;
