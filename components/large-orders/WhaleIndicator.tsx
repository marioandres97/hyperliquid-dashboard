'use client';

import { motion } from 'framer-motion';

interface WhaleIndicatorProps {
  isWhale: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function WhaleIndicator({ isWhale, size = 'md' }: WhaleIndicatorProps) {
  if (!isWhale) return null;

  const sizes = {
    sm: { container: 'px-1.5 py-0.5 text-xs', icon: 'text-sm' },
    md: { container: 'px-2 py-1 text-sm', icon: 'text-base' },
    lg: { container: 'px-3 py-1.5 text-base', icon: 'text-lg' },
  };

  const sizeClasses = sizes[size];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={`
        inline-flex items-center gap-1.5
        ${sizeClasses.container}
        bg-gradient-to-r from-purple-500/20 to-blue-500/20
        border border-purple-500/50
        rounded-lg
        backdrop-blur-xl
        shadow-lg shadow-purple-500/20
      `}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className={sizeClasses.icon}
      >
        🐋
      </motion.span>
      <span className="font-bold text-purple-400">WHALE</span>
    </motion.div>
  );
}
