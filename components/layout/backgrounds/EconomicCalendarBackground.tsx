'use client';

import React from 'react';

export default function EconomicCalendarBackground() {
  return (
    <>
      {/* Simplified gradient - professional blue/gray */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(71, 85, 105, 0.15) 100%)'
        }}
      />
      
      {/* Subtle calendar grid pattern */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
    </>
  );
}
