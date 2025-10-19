'use client';

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {/* Dashboard animated background */}
      <div className="dashboard-background">
        <div className="dashboard-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={`candlestick-${i}`} className="candlestick-bg" />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[95%] mx-auto">
        {/* Premium themed header */}
        <header className="relative overflow-hidden rounded-3xl px-6 py-5 mb-6 group">
          {/* Glassmorphic background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-purple-400/30" 
               style={{
                 boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 60px rgba(255, 255, 255, 0.05)'
               }}
          />
          
          {/* Animated shimmer overlay */}
          <div className="absolute inset-0 shimmer opacity-40" />
          
          {/* Glowing border animation */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{
                 boxShadow: '0 0 60px rgba(139, 92, 246, 0.6), inset 0 0 30px rgba(59, 130, 246, 0.3)'
               }}
          />
          
          {/* Floating market icons background */}
          <div className="absolute inset-0 overflow-hidden opacity-10" aria-hidden="true">
            <div className="absolute top-2 left-10 text-2xl animate-pulse" style={{ animationDelay: '0s' }}>₿</div>
            <div className="absolute top-4 right-20 text-xl animate-pulse" style={{ animationDelay: '1s' }}>Ξ</div>
            <div className="absolute bottom-3 left-1/4 text-lg animate-pulse" style={{ animationDelay: '2s' }}>$</div>
            <div className="absolute bottom-2 right-1/3 text-xl animate-pulse" style={{ animationDelay: '1.5s' }}>📈</div>
            <div className="absolute top-1/2 right-10 text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>💹</div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 gradient-text" style={{
              textShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
            }}>
              Hyperliquid Dashboard
            </h1>
            <p className="text-white/70">Advanced signal detection system</p>
          </div>
        </header>
        
        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}