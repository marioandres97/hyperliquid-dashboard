'use client';

import React from 'react';

export default function EconomicCalendarBackground() {
  return (
    <>
      {/* Base gradient - professional blue/gray for financial data */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(71, 85, 105, 0.15) 100%)'
        }}
      />
      
      {/* Calendar grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Data stream effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="data-stream data-stream-1" />
        <div className="data-stream data-stream-2" />
      </div>
      
      {/* Subtle institutional glow */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)'
        }}
      />
      
      <style jsx>{`
        .data-stream {
          position: absolute;
          width: 2px;
          height: 60px;
          background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.4), transparent);
          animation: streamDown 8s infinite linear;
        }
        
        .data-stream-1 {
          left: 25%;
          animation-delay: 0s;
        }
        
        .data-stream-2 {
          right: 35%;
          animation-delay: 4s;
        }
        
        @keyframes streamDown {
          0% {
            top: -10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
