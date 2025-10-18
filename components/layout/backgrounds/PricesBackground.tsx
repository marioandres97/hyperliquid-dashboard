'use client';

import React from 'react';

export default function PricesBackground() {
  return (
    <>
      {/* Scan lines */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(139, 92, 246, 0.3) 0px, transparent 1px, transparent 4px)',
          backgroundSize: '100% 4px'
        }}
      />
      
      {/* Price chart pattern in background */}
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%)'
        }}
      />
      
      {/* Ticker board effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="ticker-glow" />
      </div>
      
      <style jsx>{`
        .ticker-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
          animation: tickerSweep 8s infinite linear;
        }
        
        @keyframes tickerSweep {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
      `}</style>
    </>
  );
}
