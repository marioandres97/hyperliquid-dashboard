'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'profit' | 'loss' | 'neutral';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'neutral',
  className = '' 
}: StatsCardProps) {
  const variants = {
    profit: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      glow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]',
    },
    loss: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    },
    neutral: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      text: 'text-white',
      glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl overflow-hidden group ${className}`}
    >
      {/* Glassmorphism background */}
      <div className={`absolute inset-0 ${style.bg} backdrop-blur-xl`} />
      
      {/* Gradient border */}
      <div className={`absolute inset-0 rounded-xl border ${style.border}`} />

      {/* Hover glow effect */}
      <div className={`absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${style.glow}`} />

      {/* Content */}
      <div className="relative p-6 space-y-3">
        {/* Icon and Title */}
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${style.text}`} />
          <span className="text-sm text-gray-400 font-medium">{title}</span>
        </div>

        {/* Value */}
        <div className={`text-4xl font-bold ${style.text}`}>
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-sm text-gray-500">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
}
