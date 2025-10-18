'use client';

import React from 'react';

export default function SignalPerformanceBackground() {
  return (
    <>
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Glow overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4), transparent 70%)'
        }}
      />
      
      {/* Animated pulse */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="performance-pulse" />
      </div>
      
      <style jsx>{`
        .performance-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
          animation: pulse 6s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}
