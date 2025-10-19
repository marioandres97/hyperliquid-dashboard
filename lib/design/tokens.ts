/**
 * Premium Design System Tokens
 * 
 * Centralized design tokens for consistent luxury aesthetic
 * Apple/Stripe minimalism meets Bloomberg Terminal professionalism
 */

export const designTokens = {
  // Colors - Premium Palette
  colors: {
    // Primary gradient colors
    primary: {
      purple: '#8B5CF6',
      blue: '#3B82F6',
      indigo: '#6366F1',
    },
    
    // Accent colors with subtle glow
    accent: {
      green: '#22c55e',
      red: '#ef4444',
      yellow: '#f59e0b',
      blue: '#3b82f6',
    },
    
    // Background layers for depth
    background: {
      dark: {
        start: '#0a0e17',
        mid: '#1a1f2e',
        end: '#0f1419',
      },
      surface: {
        base: 'rgba(15, 20, 25, 0.7)',
        elevated: 'rgba(20, 25, 30, 0.8)',
        overlay: 'rgba(25, 30, 35, 0.9)',
      },
    },
    
    // Text colors
    text: {
      primary: 'rgba(255, 255, 255, 1)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.4)',
      disabled: 'rgba(255, 255, 255, 0.2)',
    },
    
    // Border colors with transparency
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      subtle: 'rgba(255, 255, 255, 0.05)',
      emphasis: 'rgba(139, 92, 246, 0.3)',
    },
  },
  
  // Spacing - 4px base unit system
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },
  
  // Typography - Professional and clean
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "Roboto Mono", "Courier New", monospace',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Border Radius - Smooth, modern curves
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows - Soft, luxurious depth
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    glow: {
      green: '0 0 20px rgba(34, 197, 94, 0.3)',
      red: '0 0 20px rgba(239, 68, 68, 0.3)',
      blue: '0 0 20px rgba(59, 130, 246, 0.3)',
      purple: '0 0 20px rgba(139, 92, 246, 0.3)',
    },
  },
  
  // Effects - Glassmorphism and blur
  effects: {
    blur: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
    },
    
    opacity: {
      subtle: 0.05,
      light: 0.1,
      medium: 0.2,
      strong: 0.4,
      heavy: 0.7,
    },
  },
  
  // Transitions - 60fps smooth animations
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Z-Index layers
  zIndex: {
    background: 0,
    base: 10,
    elevated: 20,
    overlay: 30,
    modal: 40,
    toast: 50,
  },
} as const;

// Utility function to generate glassmorphism styles
export function glassmorphism(level: 'base' | 'elevated' | 'overlay' = 'base') {
  const backgrounds = {
    base: designTokens.colors.background.surface.base,
    elevated: designTokens.colors.background.surface.elevated,
    overlay: designTokens.colors.background.surface.overlay,
  };
  
  return {
    background: backgrounds[level],
    backdropFilter: `blur(${designTokens.effects.blur.lg}) saturate(180%)`,
    WebkitBackdropFilter: `blur(${designTokens.effects.blur.lg}) saturate(180%)`,
  };
}

// Utility function to generate gradient styles
export function gradientPurpleBlue() {
  return {
    background: `linear-gradient(135deg, ${designTokens.colors.primary.purple} 0%, ${designTokens.colors.primary.blue} 100%)`,
  };
}

// Utility function for premium button styles
export function premiumButton(variant: 'primary' | 'secondary' | 'ghost' = 'primary') {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${designTokens.colors.primary.purple} 0%, ${designTokens.colors.primary.blue} 100%)`,
      color: designTokens.colors.text.primary,
      border: 'none',
    },
    secondary: {
      background: designTokens.colors.background.surface.elevated,
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.emphasis}`,
    },
    ghost: {
      background: 'transparent',
      color: designTokens.colors.text.secondary,
      border: `1px solid ${designTokens.colors.border.default}`,
    },
  };
  
  return variants[variant];
}

export type DesignTokens = typeof designTokens;
