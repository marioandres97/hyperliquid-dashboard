'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'profit' | 'loss' | 'neutral';
}

export function MetricCard({ title, value, subtitle, icon: Icon, variant = 'neutral' }: MetricCardProps) {
  const variantColors = {
    profit: 'text-emerald-500',
    loss: 'text-red-500',
    neutral: 'text-white',
  };

  return (
    <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-2">
        <p className="text-gray-400 text-sm">{title}</p>
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
      </div>
      <p className={`text-3xl font-semibold ${variantColors[variant]} mb-1`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
