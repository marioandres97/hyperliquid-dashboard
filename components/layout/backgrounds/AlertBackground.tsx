'use client';

import React from 'react';

export default function AlertBackground() {
  return (
    <>
      {/* Simplified gradient - amber/yellow theme for alerts */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.15) 100%)'
        }}
      />
      
      {/* Single pulse on hover for critical indicators */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <div className="alert-pulse" />
      </div>
      
      <style jsx>{`
        .alert-pulse {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          margin: -50px 0 0 -50px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
          animation: alertPulse 4s ease-in-out infinite;
        }
        
        @keyframes alertPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
