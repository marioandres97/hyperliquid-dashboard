'use client';

import Link from 'next/link';
import { Calendar, TrendingUp, Bell, DollarSign } from 'lucide-react';
import MarketHoursBar from '@/components/MarketHoursBar';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';

// Shared styles for navigation cards
const cardStyle = {
  background: 'var(--venom-glass-bg)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid var(--venom-glass-border)',
  minHeight: '240px',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  transitionDuration: 'var(--transition-premium)',
};

const iconStyle = {
  width: '48px',
  height: '48px',
  color: 'var(--venom-green-accent)',
  strokeWidth: '1.5px',
};

// Card hover handlers
const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.transform = 'translateY(-8px)';
  e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.2)';
  e.currentTarget.style.borderColor = 'var(--venom-glass-border-hover)';
};

const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.borderColor = 'var(--venom-glass-border)';
};

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Market Banner */}
      <div 
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(10, 14, 20, 0.8)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
        }}
      >
        <MarketHoursBar />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-8 md:px-16" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="text-center mb-20">
          <h1 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold mb-6"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: 'var(--letter-spacing-tight)',
              lineHeight: '1.2',
            }}
          >
            VENOM
          </h1>
          <p 
            className="text-xl sm:text-2xl md:text-3xl text-gray-400 max-w-3xl mx-auto font-light"
            style={{ 
              letterSpacing: 'var(--letter-spacing-tight)',
              lineHeight: '1.6',
            }}
          >
            Elite Trading Terminal
          </p>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-2xl mx-auto font-light">
            Institutional-grade analytics and precision trading tools for premium traders
          </p>
        </div>

        {/* Real-Time Prices Widget Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div 
            className="rounded-3xl p-8"
            style={{
              background: 'var(--venom-glass-bg)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid var(--venom-glass-border)',
            }}
          >
            <RealTimePricesWidget />
          </div>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Economic Calendar Card */}
          <Link href="/calendar" className="group block">
            <div 
              className="rounded-3xl p-10 transition-all"
              style={cardStyle}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <Calendar className="mb-6" style={iconStyle} />
              <h2 
                className="text-2xl font-semibold mb-3 text-white"
                style={{ letterSpacing: 'var(--letter-spacing-tight)' }}
              >
                Economic Calendar
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                High-impact events affecting crypto markets
              </p>
            </div>
          </Link>

          {/* Large Orders Feed Card */}
          <Link href="/orders" className="group block">
            <div 
              className="rounded-3xl p-10 transition-all"
              style={cardStyle}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <TrendingUp className="mb-6" style={iconStyle} />
              <h2 
                className="text-2xl font-semibold mb-3 text-white"
                style={{ letterSpacing: 'var(--letter-spacing-tight)' }}
              >
                Large Orders Feed
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Real-time institutional order flow tracking
              </p>
            </div>
          </Link>

          {/* Alert System Card */}
          <Link href="/alerts" className="group block">
            <div 
              className="rounded-3xl p-10 transition-all"
              style={cardStyle}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <Bell className="mb-6" style={iconStyle} />
              <h2 
                className="text-2xl font-semibold mb-3 text-white"
                style={{ letterSpacing: 'var(--letter-spacing-tight)' }}
              >
                Alert System
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Custom price alerts and notifications
              </p>
            </div>
          </Link>

          {/* PnL Tracker Card */}
          <Link href="/pnl" className="group block">
            <div 
              className="rounded-3xl p-10 transition-all"
              style={cardStyle}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
            >
              <DollarSign className="mb-6" style={iconStyle} />
              <h2 
                className="text-2xl font-semibold mb-3 text-white"
                style={{ letterSpacing: 'var(--letter-spacing-tight)' }}
              >
                PnL Tracker
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Comprehensive profit and loss analytics
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="border-t mt-20 py-8" 
        style={{ borderColor: 'rgba(16, 185, 129, 0.1)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-600 font-light">
            Elite trading platform. Not financial advice. DYOR. Trading involves substantial risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
