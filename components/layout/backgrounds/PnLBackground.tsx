'use client';

import React from 'react';

interface PnLBackgroundProps {
  isPositive: boolean;
}

export default function PnLBackground({ isPositive }: PnLBackgroundProps) {
  const glowColor = isPositive 
    ? 'rgba(16, 185, 129, 0.15)' // green
    : 'rgba(239, 68, 68, 0.15)'; // red
    
  return (
    <>
      {/* Subtle ledger grid lines */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Dynamic glow based on PnL - subtle */}
      <div 
        className="absolute inset-0 opacity-5 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`
        }}
      />
    </>
  );
}
