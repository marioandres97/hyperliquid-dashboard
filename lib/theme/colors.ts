// Unified color scheme for the institutional analysis platform
export const COLORS = {
  // Primary brand colors
  purple: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    glow: 'rgba(139, 92, 246, 0.3)',
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.2)',
  },
  blue: {
    primary: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    glow: 'rgba(59, 130, 246, 0.3)',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  green: {
    primary: '#10B981',
    light: '#34D399',
    dark: '#059669',
    glow: 'rgba(16, 185, 129, 0.3)',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  // Market direction colors
  bullish: '#10B981',
  bearish: '#EF4444',
  neutral: '#6B7280',
  // UI colors
  background: {
    dark: '#0a0e17',
    medium: '#1a1f2e',
    light: '#0f1419',
  },
  glass: {
    default: 'rgba(15, 23, 42, 0.6)',
    purple: 'rgba(139, 92, 246, 0.1)',
    blue: 'rgba(59, 130, 246, 0.1)',
    light: 'rgba(255, 255, 255, 0.05)',
  },
  border: {
    default: 'rgba(148, 163, 184, 0.1)',
    purple: 'rgba(139, 92, 246, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
    light: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
    muted: '#6B7280',
  },
} as const;

// Gradient styles
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #10B981 100%)',
  purpleBlue: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
  background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0f1419 100%)',
  card: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(16, 185, 129, 0.15) 100%)',
} as const;

// Glassmorphism styles
export const GLASS_STYLES = {
  default: {
    background: COLORS.glass.default,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: '16px',
  },
  purple: {
    background: COLORS.glass.purple,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${COLORS.border.purple}`,
    borderRadius: '16px',
  },
  blue: {
    background: COLORS.glass.blue,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${COLORS.border.blue}`,
    borderRadius: '16px',
  },
} as const;

// Asset-specific colors
export const ASSET_COLORS = {
  BTC: {
    primary: '#F7931A',
    glow: 'rgba(247, 147, 26, 0.3)',
    bg: 'rgba(247, 147, 26, 0.1)',
  },
  ETH: {
    primary: '#627EEA',
    glow: 'rgba(98, 126, 234, 0.3)',
    bg: 'rgba(98, 126, 234, 0.1)',
  },
  HYPE: {
    primary: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.3)',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
} as const;

export type Asset = keyof typeof ASSET_COLORS;
