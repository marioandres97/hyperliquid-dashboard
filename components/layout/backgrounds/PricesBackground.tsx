'use client';

import React from 'react';

export default function PricesBackground() {
  return (
    <>
      {/* Subtle scan lines */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(139, 92, 246, 0.3) 0px, transparent 1px, transparent 4px)',
          backgroundSize: '100% 4px'
        }}
      />
      
      {/* Price chart gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, transparent 100%)'
        }}
      />
    </>
  );
}
