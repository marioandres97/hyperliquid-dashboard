'use client';

import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--venom-base-dark)' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16 sm:mb-24">
          <h1 
            className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6"
            style={{ color: 'var(--venom-green-primary)' }}
          >
            VENOM
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto">
            Elite Trading Terminal for Premium Traders
          </p>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
            Real-time market intelligence, institutional-grade analytics, and precision trading tools
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <div 
              className="p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 255, 135, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px var(--venom-shadow-green)`;
                e.currentTarget.style.borderColor = 'var(--venom-green-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 135, 0.1)';
              }}
            >
              <div className="text-4xl mb-4">📊</div>
              <h2 
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--venom-green-primary)' }}
              >
                Dashboard
              </h2>
              <p className="text-gray-400">
                Real-time market data, price tracking, and institutional order flow analysis
              </p>
            </div>
          </Link>

          {/* Portfolio Card */}
          <Link href="/portfolio" className="group">
            <div 
              className="p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 255, 135, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px var(--venom-shadow-green)`;
                e.currentTarget.style.borderColor = 'var(--venom-green-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 135, 0.1)';
              }}
            >
              <div className="text-4xl mb-4">💼</div>
              <h2 
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--venom-green-primary)' }}
              >
                Portfolio
              </h2>
              <p className="text-gray-400">
                Track your holdings, performance metrics, and asset allocation
              </p>
            </div>
          </Link>

          {/* Positions Card */}
          <Link href="/positions" className="group">
            <div 
              className="p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 255, 135, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px var(--venom-shadow-green)`;
                e.currentTarget.style.borderColor = 'var(--venom-green-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 135, 0.1)';
              }}
            >
              <div className="text-4xl mb-4">📈</div>
              <h2 
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--venom-green-primary)' }}
              >
                Positions
              </h2>
              <p className="text-gray-400">
                Active positions monitoring with real-time P&L and risk management
              </p>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link href="/analytics" className="group">
            <div 
              className="p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 255, 135, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px var(--venom-shadow-green)`;
                e.currentTarget.style.borderColor = 'var(--venom-green-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 135, 0.1)';
              }}
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--venom-green-primary)' }}
              >
                Analytics
              </h2>
              <p className="text-gray-400">
                Advanced market analytics, signals, and trading insights
              </p>
            </div>
          </Link>
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
