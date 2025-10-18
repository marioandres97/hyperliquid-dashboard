'use client';

import React from 'react';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function WidgetContainer({ title, children }: WidgetContainerProps) {
  return (
    <div 
      className="premium-glass rounded-2xl p-6 shadow-2xl transition-all duration-300"
      style={{
        borderImage: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3)) 1',
      }}
    >
      {title && (
        <h2 
          className="text-2xl font-semibold mb-4"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
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