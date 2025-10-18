/**
 * Alert Repository
 */
import { prisma, isDatabaseAvailable } from '../client';
import { IBaseRepository, FindAllOptions } from './base.repository';
import { Alert, Prisma } from '@/lib/generated/prisma';

export class AlertRepository implements IBaseRepository<Alert, Prisma.AlertCreateInput, Prisma.AlertUpdateInput> {
  async findById(id: string): Promise<Alert | null> {
    if (!isDatabaseAvailable() || !prisma) {
      return null;
    }
    return prisma.alert.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Alert[]> {
    if (!isDatabaseAvailable() || !prisma) {
      return [];
    }
    return prisma.alert.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveAlerts(asset?: string): Promise<Alert[]> {
    if (!isDatabaseAvailable() || !prisma) {
      return [];
    }
    return prisma.alert.findMany({
      where: {
        isActive: true,
        ...(asset && { asset }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(options?: FindAllOptions): Promise<Alert[]> {
    if (!isDatabaseAvailable() || !prisma) {
      return [];
    }
    return prisma.alert.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
      where: options?.where,
    });
  }

  async create(data: Prisma.AlertCreateInput): Promise<Alert> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }
    return prisma.alert.create({ data });
  }

  async update(id: string, data: Prisma.AlertUpdateInput): Promise<Alert> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }
    return prisma.alert.update({ where: { id }, data });
  }

  async delete(id: string): Promise<boolean> {
    if (!isDatabaseAvailable() || !prisma) {
      return false;
    }
    try {
      await prisma.alert.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(where?: Prisma.AlertWhereInput): Promise<number> {
    if (!isDatabaseAvailable() || !prisma) {
      return 0;
    }
    return prisma.alert.count({ where });
  }
}

// Export singleton instance
export const alertRepository = new AlertRepository();
