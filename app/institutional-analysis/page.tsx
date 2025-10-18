'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertNotification, Alert } from '@/components/institutional-analysis/shared';
import { Module1LiquidityOrderBook } from '@/components/institutional-analysis/Module1LiquidityOrderBook';
import { Module2LargeOrdersFeed } from '@/components/institutional-analysis/Module2LargeOrdersFeed';
import { Module3TopTraders } from '@/components/institutional-analysis/Module3TopTraders';
import { Module4MarketIntention } from '@/components/institutional-analysis/Module4MarketIntention';
import { Module5VolatilityContext } from '@/components/institutional-analysis/Module5VolatilityContext';
import { Module6AlertsSystem } from '@/components/institutional-analysis/Module6AlertsSystem';
import { Activity, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InstitutionalAnalysisPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 1 | 2 | 3 | 4 | 5 | 6>('all');

  const dismissAlert = (id: string | number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const tabs: Array<{ id: 'all' | 1 | 2 | 3 | 4 | 5 | 6; label: string }> = [
    { id: 'all' as const, label: 'All Modules' },
    { id: 1 as const, label: 'Liquidity & Order Book' },
    { id: 2 as const, label: 'Large Orders Feed' },
    { id: 3 as const, label: 'Top Traders' },
    { id: 4 as const, label: 'Market Intention' },
    { id: 5 as const, label: 'Volatility & Context' },
    { id: 6 as const, label: 'Alert System' },
  ];

  return (
    <div 
      className="min-h-screen p-4 md:p-6"
      style={{
        background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0f1419 100%)',
      }}
    >
      {/* Alert Notifications */}
      <AlertNotification alerts={alerts} onDismiss={dismissAlert} position="top-right" />

      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              <ArrowLeft size={20} className="text-purple-400" />
              <span className="text-purple-200 font-semibold">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <Activity className="text-green-400 animate-pulse" size={24} />
              <span className="text-sm font-semibold text-green-400">LIVE DATA</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #10B981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Institutional Trading Analysis Platform
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time insights into institutional market movements and strategies
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: activeTab === tab.id
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'all' && (
            <div className="space-y-8">
              <div id="module-1">
                <Module1LiquidityOrderBook />
              </div>
              <div id="module-2">
                <Module2LargeOrdersFeed />
              </div>
              <div id="module-3">
                <Module3TopTraders />
              </div>
              <div id="module-4">
                <Module4MarketIntention />
              </div>
              <div id="module-5">
                <Module5VolatilityContext />
              </div>
              <div id="module-6">
                <Module6AlertsSystem />
              </div>
            </div>
          )}

          {activeTab === 1 && <Module1LiquidityOrderBook />}
          {activeTab === 2 && <Module2LargeOrdersFeed />}
          {activeTab === 3 && <Module3TopTraders />}
          {activeTab === 4 && <Module4MarketIntention />}
          {activeTab === 5 && <Module5VolatilityContext />}
          {activeTab === 6 && <Module6AlertsSystem />}
        </motion.div>
      </div>
    </div>
  );
}
