'use client';

import Link from 'next/link';
import { Calendar, TrendingUp, Bell, DollarSign } from 'lucide-react';
import MarketHoursBar from '@/components/MarketHoursBar';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';

// Shared card styles
const cardBaseStyle = {
  height: '240px',
  background: 'rgba(31, 41, 55, 0.3)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(0, 255, 135, 0.15)',
  borderRadius: '24px',
};

// Hover effect handlers
const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = `0 20px 60px rgba(0, 255, 135, 0.4)`;
  e.currentTarget.style.borderColor = 'var(--venom-green-primary)';
};

const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = 'none';
  e.currentTarget.style.borderColor = 'rgba(0, 255, 135, 0.15)';
};

export default function Landing() {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(to bottom, var(--venom-gradient-start), var(--venom-gradient-end))`,
        fontFamily: 'var(--apple-font-system)',
        letterSpacing: 'var(--apple-letter-spacing)',
      }}
    >
      {/* Market Banner */}
      <MarketHoursBar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 
            className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6"
            style={{ 
              color: 'var(--venom-green-primary)',
              letterSpacing: 'var(--apple-letter-spacing)',
            }}
          >
            VENOM
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto font-medium">
            Elite Trading Terminal for Premium Traders
          </p>
          <p className="text-base sm:text-lg text-gray-400 mt-4 max-w-xl mx-auto">
            Real-time market intelligence, institutional-grade analytics, and precision trading tools
          </p>
        </div>

        {/* Real-Time Prices Section */}
        <div className="mb-12 max-w-6xl mx-auto">
          <h2 
            className="text-2xl font-semibold mb-6 text-center"
            style={{ color: 'var(--venom-green-emerald)' }}
          >
            Real-Time Prices
          </h2>
          <RealTimePricesWidget />
        </div>

        {/* Feature Navigation Cards - 2x2 Grid */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 
            className="text-2xl font-semibold mb-8 text-center"
            style={{ color: 'var(--venom-green-emerald)' }}
          >
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Economic Calendar Card */}
            <Link href="/calendar" className="group block">
              <div 
                className="p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center text-center"
                style={cardBaseStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <Calendar 
                  size={48} 
                  className="mb-4"
                  style={{ color: 'var(--venom-green-primary)' }}
                />
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--venom-green-primary)' }}
                >
                  Economic Calendar
                </h3>
                <p className="text-gray-400 text-sm">
                  Track key economic events and market-moving news
                </p>
              </div>
            </Link>

            {/* Large Orders Feed Card */}
            <Link href="/orders" className="group block">
              <div 
                className="p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center text-center"
                style={cardBaseStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <TrendingUp 
                  size={48} 
                  className="mb-4"
                  style={{ color: 'var(--venom-green-primary)' }}
                />
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--venom-green-primary)' }}
                >
                  Large Orders Feed
                </h3>
                <p className="text-gray-400 text-sm">
                  Monitor institutional order flow in real-time
                </p>
              </div>
            </Link>

            {/* Alert System Card */}
            <Link href="/alerts" className="group block">
              <div 
                className="p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center text-center"
                style={cardBaseStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <Bell 
                  size={48} 
                  className="mb-4"
                  style={{ color: 'var(--venom-green-primary)' }}
                />
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--venom-green-primary)' }}
                >
                  Alert System
                </h3>
                <p className="text-gray-400 text-sm">
                  Custom alerts for price movements and signals
                </p>
              </div>
            </Link>

            {/* PnL Tracker Card */}
            <Link href="/pnl" className="group block">
              <div 
                className="p-6 rounded-3xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center text-center"
                style={cardBaseStyle}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                <DollarSign 
                  size={48} 
                  className="mb-4"
                  style={{ color: 'var(--venom-green-primary)' }}
                />
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--venom-green-primary)' }}
                >
                  PnL Tracker
                </h3>
                <p className="text-gray-400 text-sm">
                  Track profit and loss across all positions
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6" style={{ borderColor: 'var(--venom-gray-800)' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            Elite trading platform. Not financial advice. DYOR. Trading involves substantial risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
