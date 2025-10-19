'use client';

import React from 'react';

export default function MarketTimeBackground() {
  return (
    <>
      {/* Simplified gradient - Cyan/Blue theme */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(59, 130, 246, 0.3))'
        }}
      />
      
      {/* Subtle clock effect on hover */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <div className="clock-markers" />
      </div>
      
      <style jsx>{`
        .clock-markers {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(34, 211, 238, 0.2);
          animation: rotate 60s infinite linear;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
