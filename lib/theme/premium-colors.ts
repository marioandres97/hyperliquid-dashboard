/**
 * Premium Color System for Liquidity Flow Map
 * Inspired by Bloomberg Terminal with modern enhancements
 */

export const premiumTheme = {
  background: {
    primary: '#0A0E17',      // Deep black
    secondary: '#0F1419',    // Carbon black
    tertiary: '#141922',     // Dark gray
    glass: 'rgba(15, 20, 25, 0.8)',
  },
  accent: {
    gold: '#F59E0B',         // Premium gold
    amber: '#FBBF24',        // Amber
    platinum: '#E5E7EB',     // Platinum
    rose: '#FF006E',         // Neon rose
  },
  trading: {
    buy: {
      base: '#10B981',
      intense: '#059669',
      glow: 'rgba(16, 185, 129, 0.4)',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    sell: {
      base: '#EF4444',
      intense: '#DC2626',
      glow: 'rgba(239, 68, 68, 0.4)',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    },
    neutral: {
      base: '#6B7280',
      intense: '#4B5563',
      glow: 'rgba(107, 114, 128, 0.3)',
    }
  },
  borders: {
    subtle: 'rgba(245, 158, 11, 0.08)',
    medium: 'rgba(245, 158, 11, 0.15)',
    strong: 'rgba(245, 158, 11, 0.3)',
    glow: '0 0 20px rgba(245, 158, 11, 0.2)',
  },
  effects: {
    glassmorphism: 'backdrop-filter: blur(12px); background: rgba(15, 20, 25, 0.7);',
    glow: 'box-shadow: 0 0 30px rgba(245, 158, 11, 0.15);',
    shadow: 'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);',
  }
};

export type PremiumTheme = typeof premiumTheme;
