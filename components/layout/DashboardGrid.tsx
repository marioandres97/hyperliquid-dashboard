'use client';

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hyperliquid Dashboard
          </h1>
          <p className="text-slate-400">Real-time DEX analytics</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}