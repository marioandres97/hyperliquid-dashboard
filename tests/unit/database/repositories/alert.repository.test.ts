import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertRepository } from '@/lib/database/repositories/alert.repository';

// Mock the database client
vi.mock('@/lib/database/client', () => ({
  prisma: null,
  isDatabaseAvailable: () => false,
}));

describe('AlertRepository', () => {
  let repository: AlertRepository;

  beforeEach(() => {
    repository = new AlertRepository();
  });

  describe('findById', () => {
    it('should return null when database is not available', async () => {
      const result = await repository.findById('test-id');
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return empty array when database is not available', async () => {
      const result = await repository.findByUserId('test-user-id');
      expect(result).toEqual([]);
    });
  });

  describe('findActiveAlerts', () => {
    it('should return empty array when database is not available', async () => {
      const result = await repository.findActiveAlerts();
      expect(result).toEqual([]);
    });

    it('should return empty array for specific asset when database is not available', async () => {
      const result = await repository.findActiveAlerts('BTC');
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return empty array when database is not available', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should throw error when database is not available', async () => {
      await expect(
        repository.create({
          user: { connect: { id: 'user-id' } },
          asset: 'BTC',
          alertType: 'price_above',
          threshold: 50000,
        })
      ).rejects.toThrow('Database not available');
    });
  });

  describe('update', () => {
    it('should throw error when database is not available', async () => {
      await expect(
        repository.update('test-id', {
          isActive: false,
        })
      ).rejects.toThrow('Database not available');
    });
  });

  describe('delete', () => {
    it('should return false when database is not available', async () => {
      const result = await repository.delete('test-id');
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 when database is not available', async () => {
      const result = await repository.count();
      expect(result).toBe(0);
    });
  });
});
