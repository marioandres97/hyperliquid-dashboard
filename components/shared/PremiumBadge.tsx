'use client';

import { ReactNode } from 'react';

interface PremiumBadgeProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function PremiumBadge({ 
  children, 
  variant = 'neutral',
  size = 'md',
  className = '' 
}: PremiumBadgeProps) {
  const variants = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    neutral: 'bg-white/5 border-white/10 text-white/70',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-lg border
        backdrop-blur-sm
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
