'use client';

import Header from '@/components/Header';
import FeatureNavigation from '@/components/navigation/FeatureNavigation';
import { AlertDashboard } from '@/components/alerts/AlertDashboard';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MarketStatus {
  status: 'OPEN' | 'CLOSED';
  icon: string;
  message: string;
}

function getMarketStatus(): MarketStatus {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  
  // Simple market hours check (weekday only)
  const isWeekend = day === 0 || day === 6;
  const isMarketHours = !isWeekend && hour >= 13 && hour < 21; // NY hours
  
  if (isMarketHours) {
    const hoursLeft = 21 - hour;
    return { status: 'OPEN', icon: '🟢', message: `Markets Open (${hoursLeft}h ${60 - now.getUTCMinutes()}m)` };
  } else {
    return { status: 'CLOSED', icon: '🔴', message: 'Markets Closed' };
  }
}

export default function AlertsPage() {
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);

  useEffect(() => {
    setMarketStatus(getMarketStatus());
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#064E3B] via-[#0D1B17] to-[#0A0E14]">
      <Header />
      
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Fused Header with Market Status */}
        <div className="backdrop-blur-xl bg-white/5 border border-emerald-500/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 
                  className="text-3xl md:text-4xl font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.2',
                  }}
                >
                  Alert System
                </h1>
                <p className="text-gray-400 text-sm mt-1">Custom price alerts & notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {marketStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-2 w-2">
                    {marketStatus.status === 'OPEN' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      marketStatus.status === 'OPEN' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></span>
                  </span>
                  <span className={marketStatus.status === 'OPEN' ? 'text-emerald-400' : 'text-red-400'}>
                    {marketStatus.message}
                  </span>
                </div>
              )}
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <FeatureNavigation />

        {/* Main Content */}
        <div className="mt-8">
          <AlertDashboard />
        </div>
      </div>
    </div>
  );
}
