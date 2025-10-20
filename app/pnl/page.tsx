'use client';

import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import FeatureNavigation from '@/components/navigation/FeatureNavigation';
import { LazyPnLTracker } from '@/lib/lazy-components';

export default function PnLPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#064E3B] via-[#0D1B17] to-[#0A0E14]">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 
            className="text-5xl md:text-6xl font-semibold mb-4"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em'
            }}
          >
            PnL Tracker
          </h1>
          <p className="text-gray-400 text-lg" style={{ letterSpacing: '0.02em' }}>
            Track your trading performance and analyze profit & loss
          </p>
        </div>

        {/* Navigation Tabs */}
        <FeatureNavigation />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6 md:col-span-2">
            <p className="text-gray-400 text-sm mb-2">Total PnL</p>
            <p className="text-3xl font-semibold text-emerald-500">+$12,450</p>
            <p className="text-xs text-gray-500 mt-1">+23.5%</p>
          </div>
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Open Positions</p>
            <p className="text-3xl font-semibold text-white">8</p>
          </div>
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-3xl font-semibold text-white">67%</p>
          </div>
          <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Best Trade</p>
            <p className="text-3xl font-semibold text-emerald-500">+$3,200</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-3xl p-4 md:p-8">
          <LazyPnLTracker />
        </div>
      </div>
    </div>
  );
}
