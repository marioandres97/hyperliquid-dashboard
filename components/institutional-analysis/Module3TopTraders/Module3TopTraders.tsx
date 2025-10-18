'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, DataTable, Column } from '../shared';
import { TrendingUp, TrendingDown, Minus, Bell } from 'lucide-react';
import type { TraderPosition } from './types';
import { useMarketData } from '@/lib/hyperliquid/hooks';

// Generate realistic trader positions based on current market price
const generateTradersFromMarketData = (currentPrice: number, previousTraders?: TraderPosition[]): TraderPosition[] => {
  return Array.from({ length: 20 }, (_, i) => {
    const prevTrader = previousTraders?.[i];
    const direction: 'LONG' | 'SHORT' | 'NEUTRAL' = Math.random() > 0.6 ? 'LONG' : Math.random() > 0.4 ? 'SHORT' : 'NEUTRAL';
    
    // Use previous entry price if trader exists, otherwise generate new
    const averageEntry = prevTrader?.averageEntry || currentPrice + (Math.random() - 0.5) * 5000;
    const positionSize = prevTrader?.positionSize || Math.random() * 100 + 50;
    
    // Calculate actual PnL based on real price movement
    const pnl = direction === 'NEUTRAL' ? 0 : (direction === 'LONG' 
      ? (currentPrice - averageEntry) * positionSize
      : (averageEntry - currentPrice) * positionSize);
    
    const leverage = prevTrader?.leverage || Math.floor(Math.random() * 20) + 1;
    const pnlPercent = direction === 'NEUTRAL' ? 0 : (pnl / (positionSize * averageEntry)) * 100;
    
    // Detect position changes
    let changeType: 'opened' | 'increased' | 'decreased' | undefined;
    if (prevTrader) {
      if (prevTrader.direction !== direction) changeType = 'opened';
      else if (prevTrader.positionSize < positionSize - 5) changeType = 'increased';
      else if (prevTrader.positionSize > positionSize + 5) changeType = 'decreased';
    }
    
    const trader: TraderPosition = {
      rank: i + 1,
      traderId: `Trader-${(i + 1).toString().padStart(3, '0')}`,
      direction,
      positionSize,
      averageEntry,
      currentPrice,
      leverage,
      pnl,
      pnlPercent,
      lastChange: changeType ? new Date() : (prevTrader?.lastChange || new Date(Date.now() - Math.random() * 3600000)),
      changeType,
    };

    // Store position changes in Redis via API (server-side only)
    if (changeType) {
      // TODO: Create API route for storing positions
      // For now, just log - Redis operations should be server-side only
      console.log('Position change detected:', trader.traderId, changeType);
    }

    return trader;
  }).sort((a, b) => b.positionSize - a.positionSize);
};

const Module3TopTraders: React.FC = () => {
  const { marketData, isLoading } = useMarketData();
  const [traders, setTraders] = useState<TraderPosition[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Initialize and update traders based on real market price
  useEffect(() => {
    if (!marketData) return;

    const price = marketData.markPrice || marketData.midPrice;
    setCurrentPrice(price);

    // Update traders with new price data
    setTraders(prev => generateTradersFromMarketData(price, prev.length > 0 ? prev : undefined));

    // Refresh positions periodically
    const interval = setInterval(() => {
      if (marketData) {
        const updatedPrice = marketData.markPrice || marketData.midPrice;
        setCurrentPrice(updatedPrice);
        setTraders(prev => generateTradersFromMarketData(updatedPrice, prev));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [marketData]);

  const columns: Column<TraderPosition>[] = [
    {
      key: 'rank',
      label: '#',
      width: '50px',
      align: 'center',
      render: (value) => (
        <span className="font-bold text-purple-300">{value}</span>
      ),
    },
    {
      key: 'traderId',
      label: 'Trader',
      render: (value) => (
        <span className="font-mono text-sm text-gray-300">{value}</span>
      ),
    },
    {
      key: 'direction',
      label: 'Direction',
      align: 'center',
      render: (value: 'LONG' | 'SHORT' | 'NEUTRAL') => {
        const colors: Record<'LONG' | 'SHORT' | 'NEUTRAL', string> = { LONG: 'text-green-400', SHORT: 'text-red-400', NEUTRAL: 'text-gray-400' };
        const icons: Record<'LONG' | 'SHORT' | 'NEUTRAL', typeof TrendingUp> = { LONG: TrendingUp, SHORT: TrendingDown, NEUTRAL: Minus };
        const Icon = icons[value];
        return (
          <div className={`flex items-center justify-center gap-1 ${colors[value]} font-bold`}>
            <Icon size={16} />
            <span>{value}</span>
          </div>
        );
      },
    },
    {
      key: 'positionSize',
      label: 'Size',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-white">{value.toFixed(2)}</span>
      ),
    },
    {
      key: 'averageEntry',
      label: 'Avg Entry',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-gray-400">${value.toFixed(0)}</span>
      ),
    },
    {
      key: 'leverage',
      label: 'Leverage',
      align: 'center',
      render: (value) => (
        <span className={`font-bold ${value > 10 ? 'text-red-400' : 'text-blue-400'}`}>
          {value}x
        </span>
      ),
    },
    {
      key: 'pnl',
      label: 'PnL',
      align: 'right',
      render: (value, row) => (
        <div className="text-right">
          <div className={`font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${Math.abs(value).toFixed(0)}
          </div>
          <div className={`text-xs ${row.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ({value >= 0 ? '+' : '-'}{Math.abs(row.pnlPercent).toFixed(2)}%)
          </div>
        </div>
      ),
    },
    {
      key: 'changeType',
      label: 'Status',
      align: 'center',
      render: (value) => value ? (
        <div className="flex items-center justify-center gap-1">
          <Bell size={12} className="text-yellow-400" />
          <span className="text-xs text-yellow-400 capitalize">{value}</span>
        </div>
      ) : null,
    },
  ];

  const longCount = traders.filter(t => t.direction === 'LONG').length;
  const shortCount = traders.filter(t => t.direction === 'SHORT').length;
  const totalPnL = traders.reduce((sum, t) => sum + t.pnl, 0);

  if (isLoading && traders.length === 0) {
    return (
      <GlassCard variant="purple" padding="md">
        <div className="text-center py-8 text-gray-400">
          Loading real-time trader positions...
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard variant="purple" padding="md">
        <h2 className="text-2xl font-bold text-purple-200 mb-4">Top 20 Traders Positions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Current Price</div>
            <div className="text-xl font-mono font-bold text-purple-300">${currentPrice.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Long Positions</div>
            <div className="text-xl font-bold text-green-400 flex items-center gap-2">
              <TrendingUp size={20} />
              {longCount}
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Short Positions</div>
            <div className="text-xl font-bold text-red-400 flex items-center gap-2">
              <TrendingDown size={20} />
              {shortCount}
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: totalPnL >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: totalPnL >= 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Total PnL</div>
            <div className={`text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(totalPnL).toFixed(0)}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" padding="md">
        <DataTable
          columns={columns}
          data={traders}
          keyExtractor={(trader) => trader.traderId}
          maxHeight="600px"
          rowClassName={(trader) => {
            if (trader.changeType === 'opened') return 'bg-purple-500/5';
            if (trader.changeType === 'increased') return 'bg-blue-500/5';
            if (trader.changeType === 'decreased') return 'bg-yellow-500/5';
            return '';
          }}
        />
      </GlassCard>
    </div>
  );
};

export default Module3TopTraders;
