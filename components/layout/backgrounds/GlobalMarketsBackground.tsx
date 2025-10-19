'use client';

import React from 'react';

export default function GlobalMarketsBackground() {
  return (
    <>
      {/* Simplified gradient - Blue/Green theme */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))'
        }}
      />
      
      {/* Subtle globe effect on hover only */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 group-hover:opacity-5 transition-opacity duration-500">
        <div className="globe-ring" />
      </div>
      
      <style jsx>{`
        .globe-ring {
          position: absolute;
          width: 200px;
          height: 200px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: spin 30s infinite linear;
        }
        
        @keyframes spin {
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
