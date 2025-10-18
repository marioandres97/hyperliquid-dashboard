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
      {/* Ledger grid lines */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Dynamic glow based on PnL */}
      <div 
        className="absolute inset-0 opacity-10 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`
        }}
      />
      
      {/* Accounting paper aesthetic */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0px, transparent 1px, transparent 20px)',
        }}
      />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="ledger-gradient"
          style={{
            background: `linear-gradient(135deg, ${glowColor}, transparent)`
          }}
        />
      </div>
      
      <style jsx>{`
        .ledger-gradient {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          animation: ledgerPulse 4s ease-in-out infinite;
        }
        
        @keyframes ledgerPulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
