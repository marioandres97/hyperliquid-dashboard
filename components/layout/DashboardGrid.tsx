'use client';

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="glass rounded-3xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hyperliquid Dashboard
          </h1>
          <p className="text-white/70 mb-6">Advanced signal detection system</p>
          
          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-full bg-green-400/20 text-green-300 text-sm font-medium">
              System Active
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium">
              3 Connections
            </span>
            <span className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium">
              1 Signal Active
            </span>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}