import { describe, it, expect } from 'vitest';
import { log, Timer } from '@/lib/core/logger';

describe('Logger', () => {
  describe('log methods', () => {
    it('should have debug method', () => {
      expect(typeof log.debug).toBe('function');
    });

    it('should have info method', () => {
      expect(typeof log.info).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof log.warn).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof log.error).toBe('function');
    });

    it('should have startTimer method', () => {
      expect(typeof log.startTimer).toBe('function');
    });
  });

  describe('Timer', () => {
    it('should create a timer', () => {
      const timer = log.startTimer();
      expect(timer).toBeInstanceOf(Timer);
    });

    it('should measure duration', () => {
      const timer = log.startTimer({ operation: 'test' });
      const duration = timer.done('Test completed');
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });

    it('should accept context', () => {
      const timer = log.startTimer({ requestId: '123' });
      expect(timer).toBeInstanceOf(Timer);
    });
  });

  describe('log with context', () => {
    it('should accept context in info', () => {
      expect(() => {
        log.info('Test message', { userId: '123', asset: 'BTC' });
      }).not.toThrow();
    });

    it('should accept context in warn', () => {
      expect(() => {
        log.warn('Warning message', { requestId: 'abc' });
      }).not.toThrow();
    });

    it('should accept error and context in error', () => {
      const error = new Error('Test error');
      expect(() => {
        log.error('Error occurred', error, { context: 'test' });
      }).not.toThrow();
    });
  });
});
