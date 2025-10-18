'use client';

import React from 'react';

export default function GlobalMarketsBackground() {
  return (
    <>
      {/* Base gradient - Blue/Green theme */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))'
        }}
      />
      
      {/* Animated globe rotation */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-5">
        <div className="globe-ring globe-ring-1" />
        <div className="globe-ring globe-ring-2" />
        <div className="globe-ring globe-ring-3" />
      </div>
      
      {/* Timezone markers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="timezone-line timezone-line-1" />
        <div className="timezone-line timezone-line-2" />
        <div className="timezone-line timezone-line-3" />
      </div>
      
      {/* Market pulse indicators */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="market-pulse market-pulse-1" />
        <div className="market-pulse market-pulse-2" />
        <div className="market-pulse market-pulse-3" />
      </div>
      
      <style jsx>{`
        .globe-ring {
          position: absolute;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: spin 20s infinite linear;
        }
        
        .globe-ring-1 {
          width: 150px;
          height: 150px;
          animation-delay: 0s;
        }
        
        .globe-ring-2 {
          width: 200px;
          height: 200px;
          animation-delay: 2s;
          animation-duration: 25s;
        }
        
        .globe-ring-3 {
          width: 250px;
          height: 250px;
          animation-delay: 4s;
          animation-duration: 30s;
        }
        
        .timezone-line {
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
          animation: slideRight 10s infinite linear;
        }
        
        .timezone-line-1 {
          top: 20%;
          animation-delay: 0s;
        }
        
        .timezone-line-2 {
          top: 50%;
          animation-delay: 3s;
        }
        
        .timezone-line-3 {
          top: 80%;
          animation-delay: 6s;
        }
        
        .market-pulse {
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(16, 185, 129, 0.6);
          border-radius: 50%;
          animation: pulse-fade 4s infinite ease-in-out;
        }
        
        .market-pulse-1 {
          top: 25%;
          left: 20%;
          animation-delay: 0s;
        }
        
        .market-pulse-2 {
          top: 50%;
          left: 50%;
          animation-delay: 1.5s;
        }
        
        .market-pulse-3 {
          top: 75%;
          right: 20%;
          animation-delay: 3s;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes pulse-fade {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(2);
          }
        }
      `}</style>
    </>
  );
}
