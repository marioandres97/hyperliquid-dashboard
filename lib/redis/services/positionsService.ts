import redis, { isRedisAvailable } from '@/lib/redis';

export interface StoredPosition {
  id: string;
  coin: string;
  timestamp: number;
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
  liquidationPrice: number;
  marginUsed: number;
}

export interface RecordPositionData {
  traderId: string;
  coin: string;
  timestamp: number;
  side: 'LONG' | 'SHORT' | 'NEUTRAL';
  size: number;
  entryPrice: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
}

const POSITIONS_KEY_PREFIX = 'positions:';
const POSITIONS_LIST_PREFIX = 'positions:list:';
const TRADER_POSITIONS_PREFIX = 'trader:positions:';
const POSITIONS_RETENTION_DAYS = parseInt(process.env.REDIS_POSITIONS_RETENTION || '180');

/**
 * Record a position change for tracking
 */
export async function recordPosition(data: RecordPositionData): Promise<boolean> {
  if (!isRedisAvailable() || !redis) {
    console.warn('Redis not available, cannot record position');
    return false;
  }

  try {
    const positionId = `${data.traderId}-${data.timestamp}`;
    const key = `${POSITIONS_KEY_PREFIX}${positionId}`;
    const traderKey = `${TRADER_POSITIONS_PREFIX}${data.traderId}`;
    
    const position = {
      id: positionId,
      traderId: data.traderId,
      coin: data.coin,
      timestamp: data.timestamp,
      side: data.side,
      size: data.size,
      entryPrice: data.entryPrice,
      leverage: data.leverage,
      pnl: data.pnl,
      pnlPercent: data.pnlPercent,
    };
    
    // Store position details
    await redis.set(key, JSON.stringify(position), 'EX', POSITIONS_RETENTION_DAYS * 24 * 60 * 60);
    
    // Add to trader's position history
    await redis.zadd(traderKey, data.timestamp, positionId);
    await redis.expire(traderKey, POSITIONS_RETENTION_DAYS * 24 * 60 * 60);
    
    return true;
  } catch (error) {
    console.error('Error recording position:', error);
    return false;
  }
}

/**
 * Get position history for a specific trader
 */
export async function getPositionHistory(
  traderId: string,
  limit: number = 100
): Promise<RecordPositionData[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const traderKey = `${TRADER_POSITIONS_PREFIX}${traderId}`;
    
    // Get recent position IDs
    const positionIds = await redis.zrevrange(traderKey, 0, limit - 1);
    
    if (positionIds.length === 0) return [];
    
    const pipeline = redis.pipeline();
    positionIds.forEach(id => pipeline.get(`${POSITIONS_KEY_PREFIX}${id}`));
    const results = await pipeline.exec();
    
    const positions: RecordPositionData[] = [];
    results?.forEach(([err, data]) => {
      if (!err && data) {
        positions.push(JSON.parse(data as string));
      }
    });
    
    return positions;
  } catch (error) {
    console.error('Error getting position history:', error);
    return [];
  }
}

export async function storePosition(position: StoredPosition): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  try {
    const key = `${POSITIONS_KEY_PREFIX}${position.id}`;
    const listKey = `${POSITIONS_LIST_PREFIX}${position.coin}`;
    
    await redis.set(key, JSON.stringify(position), 'EX', POSITIONS_RETENTION_DAYS * 24 * 60 * 60);
    await redis.zadd(listKey, position.timestamp, position.id);
    await redis.expire(listKey, POSITIONS_RETENTION_DAYS * 24 * 60 * 60);
    
    return true;
  } catch (error) {
    console.error('Error storing position:', error);
    return false;
  }
}

export async function getPositions(
  coin: string,
  startTime: number,
  endTime: number,
  limit: number = 100
): Promise<StoredPosition[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const listKey = `${POSITIONS_LIST_PREFIX}${coin}`;
    const positionIds = await redis.zrangebyscore(listKey, startTime, endTime, 'LIMIT', 0, limit);
    
    if (positionIds.length === 0) return [];
    
    const pipeline = redis.pipeline();
    positionIds.forEach(id => pipeline.get(`${POSITIONS_KEY_PREFIX}${id}`));
    const results = await pipeline.exec();
    
    const positions: StoredPosition[] = [];
    results?.forEach(([err, data]) => {
      if (!err && data) {
        positions.push(JSON.parse(data as string));
      }
    });
    
    return positions;
  } catch (error) {
    console.error('Error getting positions:', error);
    return [];
  }
}

export async function getPositionStats(coin: string, startTime: number, endTime: number) {
  if (!isRedisAvailable() || !redis) {
    return {
      totalPositions: 0,
      avgSize: 0,
      avgLeverage: 0,
      totalPnL: 0,
      avgPnL: 0,
    };
  }

  try {
    const positions = await getPositions(coin, startTime, endTime, 1000);
    
    if (positions.length === 0) {
      return {
        totalPositions: 0,
        avgSize: 0,
        avgLeverage: 0,
        totalPnL: 0,
        avgPnL: 0,
      };
    }
    
    const totalSize = positions.reduce((sum, p) => sum + Math.abs(p.size), 0);
    const totalLeverage = positions.reduce((sum, p) => sum + p.leverage, 0);
    const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
    
    return {
      totalPositions: positions.length,
      avgSize: totalSize / positions.length,
      avgLeverage: totalLeverage / positions.length,
      totalPnL,
      avgPnL: totalPnL / positions.length,
    };
  } catch (error) {
    console.error('Error getting position stats:', error);
    return {
      totalPositions: 0,
      avgSize: 0,
      avgLeverage: 0,
      totalPnL: 0,
      avgPnL: 0,
    };
  }
}
