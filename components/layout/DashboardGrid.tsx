'use client';

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-[95%] mx-auto">
        <header className="glass rounded-3xl px-6 py-5 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hyperliquid Dashboard
          </h1>
          <p className="text-white/70">Advanced signal detection system</p>
        </header>
        
        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}