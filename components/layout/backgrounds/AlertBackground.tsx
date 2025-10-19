'use client';

import React from 'react';

export default function AlertBackground() {
  return (
    <>
      {/* Base gradient - amber/yellow theme for alerts */}
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.15) 100%)'
        }}
      />
      
      {/* Alert pulse effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="alert-pulse alert-pulse-1" />
        <div className="alert-pulse alert-pulse-2" />
        <div className="alert-pulse alert-pulse-3" />
      </div>
      
      {/* Bell wave pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.4) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />
      
      <style jsx>{`
        .alert-pulse {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
          animation: alertPulse 6s ease-in-out infinite;
        }
        
        .alert-pulse-1 {
          top: 20%;
          left: 15%;
          animation-delay: 0s;
        }
        
        .alert-pulse-2 {
          top: 60%;
          right: 20%;
          animation-delay: 2s;
        }
        
        .alert-pulse-3 {
          bottom: 30%;
          left: 50%;
          animation-delay: 4s;
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
