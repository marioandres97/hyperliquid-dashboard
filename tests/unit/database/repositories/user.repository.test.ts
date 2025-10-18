import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '@/lib/database/repositories/user.repository';

// Mock the database client
vi.mock('@/lib/database/client', () => ({
  prisma: null,
  isDatabaseAvailable: () => false,
}));

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
  });

  describe('findById', () => {
    it('should return null when database is not available', async () => {
      const result = await repository.findById('test-id');
      expect(result).toBeNull();
    });
  });

  describe('findByAddress', () => {
    it('should return null when database is not available', async () => {
      const result = await repository.findByAddress('test-address');
      expect(result).toBeNull();
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
          address: 'test-address',
          tier: 'free',
        })
      ).rejects.toThrow('Database not available');
    });
  });

  describe('update', () => {
    it('should throw error when database is not available', async () => {
      await expect(
        repository.update('test-id', {
          tier: 'pro',
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
