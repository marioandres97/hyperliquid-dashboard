/**
 * Premium Theme Utilities
 */

import { premiumTheme } from './premium-colors';

export const getPremiumBackground = (variant: 'primary' | 'secondary' | 'tertiary' | 'glass' = 'primary') => {
  return premiumTheme.background[variant];
};

export const getPremiumBorder = (variant: 'subtle' | 'medium' | 'strong' = 'medium') => {
  return premiumTheme.borders[variant];
};

export const getTradingColor = (side: 'buy' | 'sell' | 'neutral', variant: 'base' | 'intense' | 'glow' = 'base') => {
  return premiumTheme.trading[side][variant];
};

export const getAccentColor = (variant: 'gold' | 'amber' | 'platinum' | 'rose' = 'gold') => {
  return premiumTheme.accent[variant];
};

export * from './premium-colors';
