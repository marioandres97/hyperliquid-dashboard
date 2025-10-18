/**
 * Premium Visual Effects
 */

import { CSSProperties } from 'react';

// Glow effects
export const glowEffect = (color: string, intensity: number = 1): CSSProperties => ({
  boxShadow: `0 0 ${20 * intensity}px ${color}`,
  filter: `drop-shadow(0 0 ${10 * intensity}px ${color})`,
});

// Glassmorphism
export const glassEffect = (opacity: number = 0.7): CSSProperties => ({
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  backgroundColor: `rgba(15, 20, 25, ${opacity})`,
  border: '1px solid rgba(245, 158, 11, 0.1)',
});

// Shimmer animation for loading states
export const shimmerAnimation = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { backgroundPosition: '200% 0' },
  transition: {
    repeat: Infinity,
    duration: 2,
    ease: 'linear',
  },
};

// Pulse animation for current price
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
  },
  transition: {
    repeat: Infinity,
    duration: 2,
    ease: 'easeInOut',
  },
};

// Fade in stagger for cards
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Slide in for heatmap
export const heatmapVariants = {
  hidden: { opacity: 0, x: -50 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { type: 'spring' as const, stiffness: 100 },
  },
};
