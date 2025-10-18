'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, DataTable, Column, Alert } from '../shared';
import { Bell, Settings, Volume2, VolumeX } from 'lucide-react';

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
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([
    { id: 'liquidity_disappear', name: 'Liquidity Disappearance', enabled: true, threshold: 50, description: 'Alert when >50 BTC liquidity disappears' },
    { id: 'liquidity_appear', name: 'Large Order Appearance', enabled: true, threshold: 100, description: 'Alert when >100 BTC order appears' },
    { id: 'large_trade', name: 'Large Trade Execution', enabled: true, threshold: 25, description: 'Alert when trade >25 BTC executes' },
    { id: 'trader_position', name: 'Top Trader Position Change', enabled: true, description: 'Alert when top trader opens/closes position' },
    { id: 'funding_rate', name: 'Funding Rate Threshold', enabled: false, threshold: 0.02, description: 'Alert when funding rate crosses 0.02%' },
    { id: 'stop_hunt', name: 'Stop Hunt Detection', enabled: true, description: 'Alert when stop hunting pattern detected' },
  ]);

  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Simulate alert triggers
    const interval = setInterval(() => {
      const enabledAlerts = alertConfigs.filter(a => a.enabled);
      if (enabledAlerts.length > 0 && Math.random() > 0.7) {
        const alertConfig = enabledAlerts[Math.floor(Math.random() * enabledAlerts.length)];
        const newAlert: TriggeredAlert = {
          id: `alert-${Date.now()}`,
          type: alertConfig.name,
          message: getAlertMessage(alertConfig.id),
          timestamp: new Date(),
          details: alertConfig.description,
        };
        setTriggeredAlerts(prev => [newAlert, ...prev].slice(0, 50));
        
        if (soundEnabled) {
          // In real implementation, play sound here
          console.log('🔔 Alert triggered:', newAlert.message);
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [alertConfigs, soundEnabled]);

  const getAlertMessage = (alertId: string): string => {
    const messages: Record<string, string> = {
      liquidity_disappear: `$${(Math.random() * 100 + 50).toFixed(0)}M liquidity removed at $${(97500 + Math.random() * 1000).toFixed(0)}`,
      liquidity_appear: `Large ${Math.random() > 0.5 ? 'BUY' : 'SELL'} wall: ${(Math.random() * 100 + 100).toFixed(0)} BTC at $${(97500 + Math.random() * 1000).toFixed(0)}`,
      large_trade: `${Math.random() > 0.5 ? 'BUY' : 'SELL'} ${(Math.random() * 50 + 25).toFixed(1)} BTC - Price impact: ${(Math.random() * 2).toFixed(2)}%`,
      trader_position: `Trader-${Math.floor(Math.random() * 20 + 1).toString().padStart(3, '0')} ${['opened', 'closed', 'increased'][Math.floor(Math.random() * 3)]} position`,
      funding_rate: `Funding rate crossed ${(Math.random() * 0.04).toFixed(4)}% - ${Math.random() > 0.5 ? 'Many LONGS' : 'Many SHORTS'}`,
      stop_hunt: `Stop hunt detected at $${(97500 + Math.random() * 2000 - 1000).toFixed(0)} - Confidence: ${Math.floor(Math.random() * 30 + 70)}%`,
    };
    return messages[alertId] || 'Alert triggered';
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
