'use client';

import React from 'react';

export default function SignalPerformanceBackground() {
  return (
    <>
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Subtle glow */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4), transparent 70%)'
        }}
      />
    </>
  );
}
