'use client';

import React from 'react';

export default function OrderFlowBackground() {
  return (
    <>
      {/* Simplified gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.3))'
        }}
      />
      
      {/* Subtle flow on hover */}
      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity duration-500">
        <div className="flow-line" />
      </div>
      
      <style jsx>{`
        .flow-line {
          position: absolute;
          width: 100%;
          height: 2px;
          left: 50%;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.5), transparent);
          animation: flowUp 10s infinite linear;
        }
        
        @keyframes flowUp {
          0% {
            bottom: -10%;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            bottom: 110%;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
