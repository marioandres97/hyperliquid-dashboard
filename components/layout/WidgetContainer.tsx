'use client';

import React from 'react';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function WidgetContainer({ title, children }: WidgetContainerProps) {
  return (
    <div 
      className="rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
      style={{
        background: 'rgba(15, 20, 30, 0.7)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
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