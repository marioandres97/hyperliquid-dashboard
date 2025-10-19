'use client';

import React from 'react';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
  background?: React.ReactNode;
  transparent?: boolean;
}

export default function WidgetContainer({ title, children, background, transparent = false }: WidgetContainerProps) {
  return (
    <div 
      className={`group relative ${transparent ? 'bg-transparent' : 'premium-glass'} rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 overflow-hidden`}
    >
      {/* Background layer */}
      {background && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {background}
        </div>
      )}
      
      {/* Content layer */}
      <div className="relative z-10">
        {title && (
          <h2 
            className="text-base sm:text-lg lg:text-xl font-semibold mb-3 gradient-text"
          >
            {title}
          </h2>
        )}
        <div className="text-white/90">
          {children}
        </div>
      </div>
    </div>
  );
}