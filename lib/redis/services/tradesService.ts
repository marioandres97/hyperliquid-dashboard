import redis, { isRedisAvailable } from '@/lib/redis';

export interface StoredTrade {
  id: string;
  coin: string;
  timestamp: number;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  notional: number;
  isLarge: boolean;
}

const TRADES_KEY_PREFIX = 'trades:';
const TRADES_LIST_PREFIX = 'trades:list:';
const TRADES_RETENTION_DAYS = parseInt(process.env.REDIS_TRADES_RETENTION || '90');

/**
 * Store a trade in Redis
 */
export async function storeTrade(trade: StoredTrade): Promise<boolean> {
  if (!isRedisAvailable() || !redis) {
    console.warn('Redis not available, cannot store trade');
    return false;
  }

  try {
    const key = `${TRADES_KEY_PREFIX}${trade.id}`;
    const listKey = `${TRADES_LIST_PREFIX}${trade.coin}`;
    
    // Store trade details
    await redis.set(key, JSON.stringify(trade), 'EX', TRADES_RETENTION_DAYS * 24 * 60 * 60);
    
    // Add to sorted set with timestamp as score for time-based queries
    await redis.zadd(listKey, trade.timestamp, trade.id);
    
    // Set expiration on the sorted set
    await redis.expire(listKey, TRADES_RETENTION_DAYS * 24 * 60 * 60);
    
    return true;
  } catch (error) {
    console.error('Error storing trade:', error);
    return false;
  }
}

/**
 * Get trades for a specific coin within a time range
 */
export async function getTrades(
  coin: string,
  startTime: number,
  endTime: number,
  limit: number = 100
): Promise<StoredTrade[]> {
  if (!isRedisAvailable() || !redis) {
    return [];
  }

  try {
    const listKey = `${TRADES_LIST_PREFIX}${coin}`;
    
    // Get trade IDs within time range
    const tradeIds = await redis.zrangebyscore(
      listKey,
      startTime,
      endTime,
      'LIMIT',
      0,
      limit
    );
    
    if (tradeIds.length === 0) {
      return [];
    }
    
    // Get trade details in parallel
    const pipeline = redis.pipeline();
    tradeIds.forEach(id => pipeline.get(`${TRADES_KEY_PREFIX}${id}`));
    const results = await pipeline.exec();
    
    const trades: StoredTrade[] = [];
    results?.forEach(([err, data]) => {
      if (!err && data) {
        trades.push(JSON.parse(data as string));
      }
    });
    
    return trades;
  } catch (error) {
    console.error('Error getting trades:', error);
    return [];
  }
}

/**
 * Get large trades for a specific coin
 */
export async function getLargeTrades(
  coin: string,
  limit: number = 50
): Promise<StoredTrade[]> {
  if (!isRedisAvailable() || !redis) {
    return [];
  }

  try {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    const allTrades = await getTrades(coin, oneDayAgo, now, 500);
    return allTrades.filter(trade => trade.isLarge).slice(0, limit);
  } catch (error) {
    console.error('Error getting large trades:', error);
    return [];
  }
}

/**
 * Get trade statistics for a coin over a time period
 */
export async function getTradeStats(
  coin: string,
  startTime: number,
  endTime: number
): Promise<{
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
  avgPrice: number;
  tradeCount: number;
  largeTradeCount: number;
}> {
  if (!isRedisAvailable() || !redis) {
    return {
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0,
      avgPrice: 0,
      tradeCount: 0,
      largeTradeCount: 0,
    };
  }

  try {
    const trades = await getTrades(coin, startTime, endTime, 1000);
    
    let totalVolume = 0;
    let buyVolume = 0;
    let sellVolume = 0;
    let priceSum = 0;
    let largeTradeCount = 0;
    
    trades.forEach(trade => {
      totalVolume += trade.size;
      priceSum += trade.price;
      
      if (trade.side === 'BUY') {
        buyVolume += trade.size;
      } else {
        sellVolume += trade.size;
      }
      
      if (trade.isLarge) {
        largeTradeCount++;
      }
    });
    
    return {
      totalVolume,
      buyVolume,
      sellVolume,
      avgPrice: trades.length > 0 ? priceSum / trades.length : 0,
      tradeCount: trades.length,
      largeTradeCount,
    };
  } catch (error) {
    console.error('Error getting trade stats:', error);
    return {
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0,
      avgPrice: 0,
      tradeCount: 0,
      largeTradeCount: 0,
    };
  }
}

/**
 * Clean up old trades beyond retention period
 */
export async function cleanupOldTrades(coin: string): Promise<void> {
  if (!isRedisAvailable() || !redis) {
    return;
  }

  try {
    const listKey = `${TRADES_LIST_PREFIX}${coin}`;
    const cutoffTime = Date.now() - (TRADES_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    
    // Remove trades older than retention period
    await redis.zremrangebyscore(listKey, '-inf', cutoffTime);
  } catch (error) {
    console.error('Error cleaning up old trades:', error);
  }
}
