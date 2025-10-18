'use client';

import React from 'react';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function WidgetContainer({ title, children }: WidgetContainerProps) {
  return (
    <div 
      className="premium-glass rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20"
    >
      {title && (
        <h2 
          className="text-2xl font-semibold mb-4 gradient-text"
        >
          {title}
        </h2>
      )}
      <div className="text-white/90">
        {children}
      </div>
    </div>
  );
}