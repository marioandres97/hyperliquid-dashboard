'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, DataTable, Column, EducationalTooltip } from '../shared';
import { TrendingUp, TrendingDown, Minus, Bell } from 'lucide-react';
import type { TraderPosition } from './types';

const generateMockTraders = (currentPrice: number): TraderPosition[] => {
  return Array.from({ length: 20 }, (_, i) => {
    const direction: 'LONG' | 'SHORT' | 'NEUTRAL' = Math.random() > 0.5 ? 'LONG' : Math.random() > 0.5 ? 'SHORT' : 'NEUTRAL';
    const averageEntry = currentPrice + (Math.random() - 0.5) * 5000;
    const pnl = direction === 'NEUTRAL' ? 0 : (direction === 'LONG' 
      ? (currentPrice - averageEntry) * (Math.random() * 10 + 5)
      : (averageEntry - currentPrice) * (Math.random() * 10 + 5));
    const positionSize = Math.random() * 100 + 50;
    
    return {
      rank: i + 1,
      traderId: `Trader-${(i + 1).toString().padStart(3, '0')}`,
      direction,
      positionSize,
      averageEntry,
      currentPrice,
      leverage: Math.floor(Math.random() * 20) + 1,
      pnl,
      pnlPercent: direction === 'NEUTRAL' ? 0 : (pnl / (positionSize * averageEntry)) * 100,
      lastChange: new Date(Date.now() - Math.random() * 3600000),
      changeType: Math.random() > 0.7 ? (['opened', 'increased', 'decreased'] as const)[Math.floor(Math.random() * 3)] : undefined,
    };
  }).sort((a, b) => b.positionSize - a.positionSize);
};

const Module3TopTraders: React.FC = () => {
  const [traders, setTraders] = useState<TraderPosition[]>(generateMockTraders(97500));
  const [currentPrice] = useState(97500);

  useEffect(() => {
    const interval = setInterval(() => {
      setTraders(generateMockTraders(97500 + (Math.random() - 0.5) * 1000));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

      {/* Educational Tooltip */}
      <EducationalTooltip
        title="Entendiendo las Posiciones de Top Traders"
        content={
          <div>
            <p className="mb-3">
              Los <strong>top traders</strong> suelen ser instituciones, market makers o whales con historial probado. 
              Seguir sus posiciones puede dar pistas sobre la dirección del mercado.
            </p>
            <p className="mb-3">
              <strong>Leverage:</strong> Apalancamiento utilizado. Leverage &gt; 10x es muy riesgoso pero indica fuerte convicción.
            </p>
            <p>
              <strong>PnL%:</strong> Ganancia/pérdida no realizada. Si muchos traders long tienen PnL negativo, 
              puede haber presión de cierre que impulse el precio a la baja.
            </p>
          </div>
        }
        examples={[
          'Si 5 de los top 10 traders abren posiciones LONG, sugiere sentimiento alcista institucional.',
          'Un trader con 20x leverage y $50K de PnL tiene una convicción extremadamente alta.',
          'Cuando traders exitosos cierran posiciones rentables, puede indicar toma de ganancias antes de corrección.',
        ]}
        tips={[
          'No copies ciegamente - los institucionales pueden aguantar pérdidas que tú no puedes.',
          'Observa cambios recientes (OPENED, INCREASED) - indican timing activo.',
          'Alta concentración de SHORT en top traders con funding positivo = jugada contraria institucional.',
        ]}
      />
    </div>
  );
};

export default Module3TopTraders;
