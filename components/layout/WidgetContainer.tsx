'use client';

import React from 'react';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function WidgetContainer({ title, children }: WidgetContainerProps) {
  return (
    <div className="glass rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
      {title && <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>}
      <div className="text-white/90">
        {children}
      </div>
    </div>
  );
}