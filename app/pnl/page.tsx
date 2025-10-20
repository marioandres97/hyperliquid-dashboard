'use client';

import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import FeatureNavigation from '@/components/navigation/FeatureNavigation';
import { PnLTrackerMain } from '@/components/pnl-tracker/PnLTrackerMain';

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

        {/* Main Content */}
        <div className="mt-8">
          <PnLTrackerMain />
        </div>
      </div>
    </div>
  );
}
