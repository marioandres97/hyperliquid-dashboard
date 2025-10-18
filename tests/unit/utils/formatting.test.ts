import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatCompactNumber,
  formatPercent,
  formatRelativeTime,
  formatAddress,
  getSideColor,
  getChangeColor,
} from '@/lib/utils/formatting';

describe('Formatting Utilities', () => {
  describe('formatPrice', () => {
    it('should format price with correct decimals', () => {
      expect(formatPrice(1234.56, 2)).toBe('$1,234.56');
      expect(formatPrice(1234.5678, 4)).toBe('$1,234.5678');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers with suffixes', () => {
      expect(formatCompactNumber(1000)).toBe('1.00K');
      expect(formatCompactNumber(1000000)).toBe('1.00M');
      expect(formatCompactNumber(1000000000)).toBe('1.00B');
    });

    it('should format small numbers without suffix', () => {
      expect(formatCompactNumber(100)).toBe('100.00');
    });
  });

  describe('formatPercent', () => {
    it('should format positive percentage with sign', () => {
      expect(formatPercent(5.5, 2, true)).toBe('+5.50%');
    });

    it('should format negative percentage', () => {
      expect(formatPercent(-5.5, 2, true)).toBe('-5.50%');
    });

    it('should format without sign when specified', () => {
      expect(formatPercent(5.5, 2, false)).toBe('5.50%');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format seconds ago', () => {
      const timestamp = Date.now() - 30000; // 30 seconds ago
      const result = formatRelativeTime(timestamp);
      expect(result).toContain('second');
    });

    it('should format minutes ago', () => {
      const timestamp = Date.now() - 120000; // 2 minutes ago
      const result = formatRelativeTime(timestamp);
      expect(result).toContain('minute');
    });
  });

  describe('formatAddress', () => {
    it('should truncate long addresses', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      const formatted = formatAddress(address);
      expect(formatted).toBe('0x1234...5678');
    });

    it('should return short addresses as-is', () => {
      const address = '0x1234';
      const formatted = formatAddress(address);
      expect(formatted).toBe('0x1234');
    });
  });

  describe('getSideColor', () => {
    it('should return green for BUY/LONG', () => {
      expect(getSideColor('BUY')).toBe('text-green-400');
      expect(getSideColor('LONG')).toBe('text-green-400');
    });

    it('should return red for SELL/SHORT', () => {
      expect(getSideColor('SELL')).toBe('text-red-400');
      expect(getSideColor('SHORT')).toBe('text-red-400');
    });
  });

  describe('getChangeColor', () => {
    it('should return green for positive values', () => {
      expect(getChangeColor(5)).toBe('text-green-400');
    });

    it('should return red for negative values', () => {
      expect(getChangeColor(-5)).toBe('text-red-400');
    });

    it('should return gray for zero', () => {
      expect(getChangeColor(0)).toBe('text-gray-400');
    });
  });
});
