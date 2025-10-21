/**
 * Whale Trade Repository
 * 
 * Repository for managing whale trade data with type-safe operations
 */
import { prisma, isDatabaseAvailable } from '@/lib/database/client';
import { WhaleTrade } from '@/lib/generated/prisma';
import { IBaseRepository, FindAllOptions } from './base.repository';
import { log } from '@/lib/core/logger';

export interface CreateWhaleTradeInput {
  asset: string;
  side: string;
  price: number;
  size: number;
  notionalValue: number;
  category: WhaleTradeCategory;
  exchange?: string;
  tradeId?: string;
  timestamp?: Date;
  priceImpact?: number;
  metadata?: any;
}

export interface UpdateWhaleTradeInput {
  priceImpact?: number;
  metadata?: any;
}

export enum WhaleTradeCategory {
  MEGA_WHALE = 'MEGA_WHALE',
  WHALE = 'WHALE',
  INSTITUTION = 'INSTITUTION',
  LARGE = 'LARGE',
}

export interface WhaleTradeFilters {
  asset?: string;
  category?: WhaleTradeCategory;
  side?: 'BUY' | 'SELL';
  minNotionalValue?: number;
  maxNotionalValue?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface WhaleTradeStats {
  totalTrades: number;
  totalVolume: number;
  avgTradeSize: number;
  buyCount: number;
  sellCount: number;
  byCategory: Record<WhaleTradeCategory, number>;
  byAsset: Record<string, number>;
}

class WhaleTradeRepository implements IBaseRepository<WhaleTrade, CreateWhaleTradeInput, UpdateWhaleTradeInput> {
  async findById(id: string): Promise<WhaleTrade | null> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return null;
    }

    try {
      return await prisma.whaleTrade.findUnique({
        where: { id },
      });
    } catch (error) {
      log.error('Error finding whale trade by ID', error);
      throw error;
    }
  }

  async findAll(options?: FindAllOptions): Promise<WhaleTrade[]> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return [];
    }

    try {
      return await prisma.whaleTrade.findMany({
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy || { timestamp: 'desc' },
        where: options?.where,
      });
    } catch (error) {
      log.error('Error finding all whale trades', error);
      throw error;
    }
  }

  async create(data: CreateWhaleTradeInput): Promise<WhaleTrade> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }

    try {
      return await prisma.whaleTrade.create({
        data: {
          asset: data.asset,
          side: data.side,
          price: data.price,
          size: data.size,
          notionalValue: data.notionalValue,
          category: data.category,
          exchange: data.exchange || 'Hyperliquid',
          tradeId: data.tradeId,
          timestamp: data.timestamp || new Date(),
          priceImpact: data.priceImpact,
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      log.error('Error creating whale trade', error);
      throw error;
    }
  }

  async update(id: string, data: UpdateWhaleTradeInput): Promise<WhaleTrade> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }

    try {
      return await prisma.whaleTrade.update({
        where: { id },
        data,
      });
    } catch (error) {
      log.error('Error updating whale trade', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!isDatabaseAvailable() || !prisma) {
      throw new Error('Database not available');
    }

    try {
      await prisma.whaleTrade.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      log.error('Error deleting whale trade', error);
      return false;
    }
  }

  async count(where?: any): Promise<number> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return 0;
    }

    try {
      return await prisma.whaleTrade.count({ where });
    } catch (error) {
      log.error('Error counting whale trades', error);
      return 0;
    }
  }

  /**
   * Find whale trades with filters
   */
  async findWithFilters(filters: WhaleTradeFilters, options?: FindAllOptions): Promise<WhaleTrade[]> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return [];
    }

    const where: any = {};

    if (filters.asset) {
      where.asset = filters.asset;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.side) {
      where.side = filters.side;
    }

    if (filters.minNotionalValue !== undefined) {
      where.notionalValue = { ...where.notionalValue, gte: filters.minNotionalValue };
    }

    if (filters.maxNotionalValue !== undefined) {
      where.notionalValue = { ...where.notionalValue, lte: filters.maxNotionalValue };
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    try {
      return await prisma.whaleTrade.findMany({
        where,
        skip: options?.skip,
        take: options?.take,
        orderBy: options?.orderBy || { timestamp: 'desc' },
      });
    } catch (error) {
      log.error('Error finding whale trades with filters', error);
      throw error;
    }
  }

  /**
   * Get statistics for whale trades
   */
  async getStats(filters?: WhaleTradeFilters): Promise<WhaleTradeStats> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return this.getEmptyStats();
    }

    const where: any = {};

    if (filters?.asset) {
      where.asset = filters.asset;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters?.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters?.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    try {
      const trades = await prisma.whaleTrade.findMany({ where });

      const totalTrades = trades.length;
      const totalVolume = trades.reduce((sum, t) => sum + t.notionalValue, 0);
      const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
      const buyCount = trades.filter(t => t.side === 'BUY').length;
      const sellCount = trades.filter(t => t.side === 'SELL').length;

      const byCategory: Record<WhaleTradeCategory, number> = {
        [WhaleTradeCategory.MEGA_WHALE]: 0,
        [WhaleTradeCategory.WHALE]: 0,
        [WhaleTradeCategory.INSTITUTION]: 0,
        [WhaleTradeCategory.LARGE]: 0,
      };

      const byAsset: Record<string, number> = {};

      trades.forEach(trade => {
        byCategory[trade.category as WhaleTradeCategory] = 
          (byCategory[trade.category as WhaleTradeCategory] || 0) + 1;
        byAsset[trade.asset] = (byAsset[trade.asset] || 0) + 1;
      });

      return {
        totalTrades,
        totalVolume,
        avgTradeSize,
        buyCount,
        sellCount,
        byCategory,
        byAsset,
      };
    } catch (error) {
      log.error('Error getting whale trade stats', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get recent whale trades (last 24 hours by default)
   */
  async getRecent(hours: number = 24, limit: number = 100): Promise<WhaleTrade[]> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return [];
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    try {
      return await prisma.whaleTrade.findMany({
        where: {
          timestamp: {
            gte: startDate,
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (error) {
      log.error('Error getting recent whale trades', error);
      return [];
    }
  }

  /**
   * Delete old whale trades beyond retention period
   */
  async cleanupOld(daysToKeep: number = 30): Promise<number> {
    if (!isDatabaseAvailable() || !prisma) {
      log.warn('Database not available');
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const result = await prisma.whaleTrade.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });
      
      log.info(`Cleaned up ${result.count} old whale trades`);
      return result.count;
    } catch (error) {
      log.error('Error cleaning up old whale trades', error);
      return 0;
    }
  }

  private getEmptyStats(): WhaleTradeStats {
    return {
      totalTrades: 0,
      totalVolume: 0,
      avgTradeSize: 0,
      buyCount: 0,
      sellCount: 0,
      byCategory: {
        [WhaleTradeCategory.MEGA_WHALE]: 0,
        [WhaleTradeCategory.WHALE]: 0,
        [WhaleTradeCategory.INSTITUTION]: 0,
        [WhaleTradeCategory.LARGE]: 0,
      },
      byAsset: {},
    };
  }
}

export const whaleTradeRepository = new WhaleTradeRepository();
