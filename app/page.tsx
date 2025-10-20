'use client';

import Link from 'next/link';
import { Calendar, TrendingUp, Bell, DollarSign } from 'lucide-react';
import MarketHoursBar from '@/components/MarketHoursBar';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';

// Shared card styles - Premium refinements
const cardBaseStyle = {
  height: '240px',
  background: 'rgba(31, 41, 55, 0.3)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(16, 185, 129, 0.1)',
  borderRadius: '24px',
  padding: '48px',
  boxShadow: `
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.15),
    0 20px 40px rgba(16, 185, 129, 0.1)
  `,
  transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Hover effect handlers - Premium multi-layer shadows
const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = `
    0 8px 12px rgba(0, 0, 0, 0.15),
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 30px 60px rgba(16, 185, 129, 0.25)
  `;
  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
};

const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.boxShadow = `
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.15),
    0 20px 40px rgba(16, 185, 129, 0.1)
  `;
  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)';
  e.currentTarget.style.transform = 'translateY(0) scale(1)';
};

export default function Landing() {
  return (
    <div 
      className="min-h-screen grain-overlay fade-in"
      style={{ 
        background: `linear-gradient(to bottom, var(--venom-gradient-start), var(--venom-gradient-mid), var(--venom-gradient-end))`,
        fontFamily: 'var(--apple-font-system)',
        letterSpacing: 'var(--apple-letter-spacing)',
      }}
    >
      {/* Market Banner */}
      <MarketHoursBar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-40 pb-12">
        <div className="text-center mb-32">
          <h1 
            className="text-7xl sm:text-8xl md:text-9xl font-bold mb-6"
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
            }}
          >
            Venomouz Insightz
          </h1>
          <p 
            className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto font-medium"
            style={{ letterSpacing: '0.05em' }}
          >
            Elite Trading Terminal for Premium Traders
          </p>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl mx-auto font-normal" style={{ lineHeight: '1.8' }}>
            Real-time market intelligence, institutional-grade analytics, and precision trading tools
          </p>
        </div>

        {/* Real-Time Prices Section */}
        <div className="mb-32 max-w-6xl mx-auto">
          <h2 
            className="text-2xl font-semibold mb-6 text-center"
            style={{ color: 'var(--venom-green-emerald)', letterSpacing: '-0.03em', fontWeight: 600 }}
          >
            Real-Time Prices
          </h2>
          <RealTimePricesWidget />
        </div>

        {/* Feature Navigation Cards - 2x2 Grid */}
        <div className="max-w-4xl mx-auto mb-32">
          <h2 
            className="text-2xl font-semibold mb-12 text-center"
            style={{ color: 'var(--venom-green-emerald)', letterSpacing: '-0.03em', fontWeight: 600 }}
          >
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {/* Economic Calendar Card */}
            <Link href="/calendar" className="group block">
              <div 
                className="rounded-3xl flex flex-col items-center justify-center text-center"
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
                  className="text-xl mb-3"
                  style={{ color: 'var(--venom-green-primary)', letterSpacing: '-0.03em', fontWeight: 600 }}
                >
                  Economic Calendar
                </h3>
                <p className="text-gray-500 text-sm font-normal" style={{ lineHeight: '1.8' }}>
                  Track key economic events and market-moving news
                </p>
              </div>
            </Link>

            {/* Large Orders Feed Card */}
            <Link href="/orders" className="group block">
              <div 
                className="rounded-3xl flex flex-col items-center justify-center text-center"
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
                  className="text-xl mb-3"
                  style={{ color: 'var(--venom-green-primary)', letterSpacing: '-0.03em', fontWeight: 600 }}
                >
                  Large Orders Feed
                </h3>
                <p className="text-gray-500 text-sm font-normal" style={{ lineHeight: '1.8' }}>
                  Monitor institutional order flow in real-time
                </p>
              </div>
            </Link>

            {/* Alert System Card */}
            <Link href="/alerts" className="group block">
              <div 
                className="rounded-3xl flex flex-col items-center justify-center text-center"
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
                  className="text-xl mb-3"
                  style={{ color: 'var(--venom-green-primary)', letterSpacing: '-0.03em', fontWeight: 600 }}
                >
                  Alert System
                </h3>
                <p className="text-gray-500 text-sm font-normal" style={{ lineHeight: '1.8' }}>
                  Custom alerts for price movements and signals
                </p>
              </div>
            </Link>

            {/* PnL Tracker Card */}
            <Link href="/pnl" className="group block">
              <div 
                className="rounded-3xl flex flex-col items-center justify-center text-center"
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
                  className="text-xl mb-3"
                  style={{ color: 'var(--venom-green-primary)', letterSpacing: '-0.03em', fontWeight: 600 }}
                >
                  PnL Tracker
                </h3>
                <p className="text-gray-500 text-sm font-normal" style={{ lineHeight: '1.8' }}>
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
