/**
 * User Repository
 */
import { prisma, isDatabaseAvailable } from '../client';
import { IBaseRepository, FindAllOptions } from './base.repository';
import { User, Prisma } from '@/lib/generated/prisma';

export class UserRepository implements IBaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  async findById(id: string): Promise<User | null> {
    if (!isDatabaseAvailable() || !prisma) {
      return null;
    }
    return prisma.user.findUnique({ where: { id } });
  }

  async findByAddress(address: string): Promise<User | null> {
    if (!isDatabaseAvailable() || !prisma) {
      return null;
    }
    return prisma.user.findUnique({ where: { address } });
  }

  async findAll(options?: FindAllOptions): Promise<User[]> {
    if (!isDatabaseAvailable() || !prisma) {
      return [];
    }
    return prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
      where: options?.where,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    if (!isDatabaseAvailable() || !prisma) {
      return false;
    }
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    if (!isDatabaseAvailable() || !prisma) {
      return 0;
    }
    return prisma.user.count({ where });
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
