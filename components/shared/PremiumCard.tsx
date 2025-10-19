'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { designTokens } from '@/lib/design/tokens';

interface PremiumCardProps {
  children: ReactNode;
  hover?: boolean;
  glow?: 'green' | 'red' | 'blue' | 'purple' | 'none';
  className?: string;
  onClick?: () => void;
}

export function PremiumCard({ 
  children, 
  hover = true, 
  glow = 'none',
  className = '',
  onClick 
}: PremiumCardProps) {
  const glowColors = {
    green: 'bg-green-500/20',
    red: 'bg-red-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl" />
      
      {/* Subtle gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-50" />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-900/70" />

      {/* Glow effect on hover */}
      {hover && glow !== 'none' && (
        <div className={`absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${glowColors[glow]}`} />
      )}

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}
