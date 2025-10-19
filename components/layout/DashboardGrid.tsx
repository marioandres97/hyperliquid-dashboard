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
        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}