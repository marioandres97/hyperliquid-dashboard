'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, DataTable, Column, Alert, EducationalTooltip } from '../shared';
import { Bell, Settings, Volume2, VolumeX } from 'lucide-react';
import { useTrades, useMarketData, useOrderBook } from '@/lib/hyperliquid/hooks';

interface AlertConfig {
  id: string;
  name: string;
  enabled: boolean;
  threshold?: number;
  description: string;
}

interface TriggeredAlert {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  details: string;
}

const Module6AlertsSystem: React.FC = () => {
  const { trades } = useTrades(50);
  const { marketData } = useMarketData();
  const { orderBook } = useOrderBook(15);
  
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([
    { id: 'liquidity_disappear', name: 'Liquidity Disappearance', enabled: true, threshold: 50, description: 'Alert when >50 BTC liquidity disappears' },
    { id: 'liquidity_appear', name: 'Large Order Appearance', enabled: true, threshold: 100, description: 'Alert when >100 BTC order appears' },
    { id: 'large_trade', name: 'Large Trade Execution', enabled: true, threshold: 10, description: 'Alert when trade >10 BTC executes' },
    { id: 'funding_rate', name: 'Funding Rate Threshold', enabled: true, threshold: 0.02, description: 'Alert when funding rate crosses 0.02%' },
    { id: 'price_change', name: 'Rapid Price Change', enabled: true, threshold: 2, description: 'Alert when price changes >2% in 5 min' },
    { id: 'volume_spike', name: 'Volume Spike', enabled: true, threshold: 50, description: 'Alert when volume spikes >50% above average' },
  ]);

  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousOrderBookSize, setPreviousOrderBookSize] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);

  // Monitor real-time data for alert conditions
  useEffect(() => {
    // Check large trades
    if (trades.length > 0 && alertConfigs.find(a => a.id === 'large_trade')?.enabled) {
      const config = alertConfigs.find(a => a.id === 'large_trade');
      const threshold = config?.threshold || 10;
      
      const largeTrades = trades.filter(t => t.isLarge && t.size >= threshold);
      if (largeTrades.length > 0) {
        const latestLargeTrade = largeTrades[0];
        const message = `${latestLargeTrade.side} ${latestLargeTrade.size.toFixed(4)} BTC at $${latestLargeTrade.price.toFixed(0)}`;
        
        triggerAlert('large_trade', 'Large Trade Execution', message, config?.description || '');
        // TODO: Store alerts in Redis via API route
      }
    }
  }, [trades, alertConfigs]);

  // Monitor funding rate
  useEffect(() => {
    if (!marketData || !alertConfigs.find(a => a.id === 'funding_rate')?.enabled) return;
    
    const config = alertConfigs.find(a => a.id === 'funding_rate');
    const threshold = config?.threshold || 0.02;
    
    if (Math.abs(marketData.fundingRate) >= threshold) {
      const message = `Funding rate at ${(marketData.fundingRate * 100).toFixed(4)}% - ${marketData.fundingRate > 0 ? 'Many LONGS' : 'Many SHORTS'}`;
      triggerAlert('funding_rate', 'Funding Rate Alert', message, config?.description || '');
      // TODO: Store alerts in Redis via API route
    }
  }, [marketData, alertConfigs]);

  // Monitor order book for liquidity changes
  useEffect(() => {
    if (!orderBook || !alertConfigs.find(a => a.id === 'liquidity_disappear')?.enabled) return;
    
    const totalBidLiquidity = orderBook.bids.reduce((sum, level) => sum + level.volume, 0);
    const totalAskLiquidity = orderBook.asks.reduce((sum, level) => sum + level.volume, 0);
    const totalLiquidity = totalBidLiquidity + totalAskLiquidity;
    
    if (previousOrderBookSize > 0) {
      const liquidityChange = previousOrderBookSize - totalLiquidity;
      const config = alertConfigs.find(a => a.id === 'liquidity_disappear');
      const threshold = config?.threshold || 50;
      
      if (liquidityChange >= threshold) {
        const message = `${liquidityChange.toFixed(2)} BTC liquidity removed at $${orderBook.currentPrice.toFixed(0)}`;
        triggerAlert('liquidity_disappear', 'Liquidity Disappearance', message, config?.description || '');
        // TODO: Store alerts in Redis via API route
      }
    }
    
    setPreviousOrderBookSize(totalLiquidity);
  }, [orderBook, previousOrderBookSize, alertConfigs]);

  // Monitor price changes
  useEffect(() => {
    if (!marketData || !alertConfigs.find(a => a.id === 'price_change')?.enabled) return;
    
    const currentPrice = marketData.markPrice || marketData.midPrice;
    
    if (previousPrice > 0) {
      const priceChange = Math.abs(((currentPrice - previousPrice) / previousPrice) * 100);
      const config = alertConfigs.find(a => a.id === 'price_change');
      const threshold = config?.threshold || 2;
      
      if (priceChange >= threshold) {
        const direction = currentPrice > previousPrice ? 'UP' : 'DOWN';
        const message = `Price ${direction} ${priceChange.toFixed(2)}% to $${currentPrice.toFixed(0)}`;
        triggerAlert('price_change', 'Rapid Price Change', message, config?.description || '');
        // TODO: Store alerts in Redis via API route
      }
    }
    
    setPreviousPrice(currentPrice);
  }, [marketData, previousPrice, alertConfigs]);

  const triggerAlert = (id: string, type: string, message: string, details: string) => {
    const newAlert: TriggeredAlert = {
      id: `alert-${Date.now()}-${id}`,
      type,
      message,
      timestamp: new Date(),
      details,
    };
    
    setTriggeredAlerts(prev => {
      // Avoid duplicate alerts within 30 seconds
      const recent = prev.find(a => 
        a.type === type && 
        Date.now() - a.timestamp.getTime() < 30000
      );
      if (recent) return prev;
      
      if (soundEnabled) {
        console.log('🔔 Alert triggered:', message);
      }
      
      return [newAlert, ...prev].slice(0, 50);
    });
  };

  const toggleAlert = (id: string) => {
    setAlertConfigs(prev => 
      prev.map(config => 
        config.id === id ? { ...config, enabled: !config.enabled } : config
      )
    );
  };

  const updateThreshold = (id: string, value: number) => {
    setAlertConfigs(prev =>
      prev.map(config =>
        config.id === id ? { ...config, threshold: value } : config
      )
    );
  };

  const configColumns: Column<AlertConfig>[] = [
    {
      key: 'enabled',
      label: 'Status',
      width: '80px',
      align: 'center',
      render: (value, row) => (
        <button
          onClick={() => toggleAlert(row.id)}
          className={`w-12 h-6 rounded-full transition-all ${
            value ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
              value ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      ),
    },
    {
      key: 'name',
      label: 'Alert Type',
      render: (value) => (
        <span className="font-semibold text-white">{value}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <span className="text-sm text-gray-400">{value}</span>
      ),
    },
    {
      key: 'threshold',
      label: 'Threshold',
      width: '150px',
      render: (value, row) => value !== undefined ? (
        <input
          type="number"
          value={value}
          onChange={(e) => updateThreshold(row.id, parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 rounded bg-black/40 border border-purple-500/30 text-white text-sm"
          disabled={!row.enabled}
        />
      ) : (
        <span className="text-gray-500">-</span>
      ),
    },
  ];

  const historyColumns: Column<TriggeredAlert>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      width: '120px',
      render: (value) => (
        <span className="font-mono text-xs text-gray-400">
          {value.toLocaleTimeString()}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className="font-semibold text-purple-300">{value}</span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (value) => (
        <span className="text-sm text-white">{value}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Educational Tooltip */}
      <EducationalTooltip
        sections={{
          howToAnalyze: [
            'Alertas de liquidez: Cuando desaparece >50 BTC = ballenas preparando movimiento',
            'Trades grandes: Ejecuciones institucionales que mueven mercado inmediatamente',
            'Funding rate: Cruce de umbrales críticos indica desbalance retail vs institucional',
            'Cambios de precio rápidos: >2% en minutos = noticias o movimiento coordinado',
          ],
          example: 'Alerta: "Liquidez desapareció 100 BTC en $97k" → Los institucionales retiraron órdenes, esperan precio diferente. No operes hasta que vuelva liquidez.',
          tip: 'Activa alertas para niveles clave ($95k, $98k, $100k). Cuando salte alerta + volumen alto, es señal de breakout o rechazo fuerte.',
        }}
      />

      <GlassCard variant="purple" padding="md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-purple-200">Smart Alert System</h2>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              background: soundEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: soundEnabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="text-sm font-semibold">
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Active Alerts</div>
            <div className="text-2xl font-bold text-green-400">
              {alertConfigs.filter(a => a.enabled).length} / {alertConfigs.length}
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Triggered Today</div>
            <div className="text-2xl font-bold text-blue-400">{triggeredAlerts.length}</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Last Alert</div>
            <div className="text-sm font-mono text-yellow-400">
              {triggeredAlerts[0]?.timestamp.toLocaleTimeString() || 'No alerts yet'}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Alert Configuration */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-blue-400" />
          <h3 className="text-lg font-bold text-gray-200">Alert Configuration</h3>
        </div>
        <DataTable
          columns={configColumns}
          data={alertConfigs}
          keyExtractor={(config) => config.id}
          maxHeight="400px"
          stickyHeader={false}
        />
      </GlassCard>

      {/* Alert History */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className="text-purple-400" />
          <h3 className="text-lg font-bold text-gray-200">Alert History</h3>
        </div>
        <DataTable
          columns={historyColumns}
          data={triggeredAlerts}
          keyExtractor={(alert) => alert.id}
          maxHeight="500px"
          emptyMessage="No alerts triggered yet"
        />
      </GlassCard>
    </div>
  );
};

export default Module6AlertsSystem;
