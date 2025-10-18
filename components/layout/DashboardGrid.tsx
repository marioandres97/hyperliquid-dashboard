'use client';

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header 
          className="rounded-3xl p-8 mb-6"
          style={{
            background: 'rgba(15, 20, 30, 0.7)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hyperliquid Dashboard
          </h1>
          <p className="text-white/70 mb-6">Advanced signal detection system</p>
          
          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-full bg-green-400/20 text-green-300 text-sm font-medium border border-green-400/30">
              System Active
            </span>
            <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30">
              3 Connections
            </span>
            <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30">
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