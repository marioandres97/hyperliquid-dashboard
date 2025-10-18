import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  HyperliquidAPIError,
  InternalError,
} from '@/lib/core/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.context).toBeUndefined();
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('should create an AppError with custom values', () => {
      const context = { userId: '123', asset: 'BTC' };
      const error = new AppError('Custom error', 400, false, context);
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.context).toEqual(context);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with status code 400', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('ValidationError');
    });

    it('should use default message when none provided', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
    });

    it('should include context', () => {
      const context = { field: 'email', value: 'invalid' };
      const error = new ValidationError('Email is invalid', context);
      expect(error.context).toEqual(context);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with status code 401', () => {
      const error = new AuthenticationError('Unauthorized');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with status code 404', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('RateLimitError', () => {
    it('should create a RateLimitError with status code 429', () => {
      const error = new RateLimitError('Too many requests');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('HyperliquidAPIError', () => {
    it('should create a HyperliquidAPIError with status code 502', () => {
      const error = new HyperliquidAPIError('API unavailable');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(502);
      expect(error.name).toBe('HyperliquidAPIError');
    });
  });

  describe('InternalError', () => {
    it('should create an InternalError with status code 500 and isOperational false', () => {
      const error = new InternalError('Something went wrong');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
      expect(error.name).toBe('InternalError');
    });
  });
});
