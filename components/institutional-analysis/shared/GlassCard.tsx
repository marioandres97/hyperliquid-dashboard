import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'purple' | 'blue';
  padding?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  animate = true,
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantStyles = {
    default: {
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    purple: {
      background: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.2)',
    },
    blue: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.2)',
    },
  };

  const cardStyle = {
    ...variantStyles[variant],
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
  };

  const CardComponent = animate ? motion.div : 'div';

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' as const },
      }
    : {};

  return (
    <CardComponent
      className={`${paddingClasses[padding]} ${className}`}
      style={cardStyle}
      {...animationProps}
    >
      {children}
    </CardComponent>
  );
};

export default GlassCard;
