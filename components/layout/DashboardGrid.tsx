'use client';

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-screen px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-4 sm:py-6">
      {/* Simplified background - NO effects */}
      <div className="dashboard-background" />

      <div className="relative z-10 w-full max-w-[95%] sm:max-w-[90%] xl:max-w-[1920px] mx-auto">
        {/* Optimized tetris/puzzle fit - minimal gaps */}
        {/* Mobile (1 col), Tablet (2 col), Desktop XL (3 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-4 lg:gap-5 xl:gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}