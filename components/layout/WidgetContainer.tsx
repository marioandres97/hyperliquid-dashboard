'use client';

import React from 'react';

interface WidgetContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function WidgetContainer({ title, children }: WidgetContainerProps) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="text-slate-300">
        {children}
      </div>
    </div>
  );
}