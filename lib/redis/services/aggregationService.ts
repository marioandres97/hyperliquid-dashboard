import redis, { isRedisAvailable } from '@/lib/redis';

export interface AggregatedData {
  coin: string;
  timestamp: number;
  interval: 'hourly' | 'daily';
  
  // Price data
  open: number;
  high: number;
  low: number;
  close: number;
  
  // Volume data
  volume: number;
  buyVolume: number;
  sellVolume: number;
  
  // Trade counts
  tradeCount: number;
  largeTradeCount: number;
  
  // Statistical data
  avgPrice: number;
  avgSize: number;
}

const AGGREGATED_PREFIX = 'aggregated:';
const HOURLY_PREFIX = 'aggregated:hourly:';
const DAILY_PREFIX = 'aggregated:daily:';

// Retention periods
const RAW_TRADES_RETENTION_DAYS = 7;
const HOURLY_RETENTION_DAYS = 30;
const DAILY_RETENTION_DAYS = 365;

/**
 * Aggregate raw trades into hourly data
 */
export async function aggregateToHourly(coin: string, startTime: number, endTime: number): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  try {
    // Round to hour boundaries
    const hourStart = Math.floor(startTime / 3600000) * 3600000;
    const hourEnd = Math.floor(endTime / 3600000) * 3600000;

    // Get trades for this hour
    const tradesListKey = `trades:list:${coin}`;
    const tradeIds = await redis.zrangebyscore(tradesListKey, hourStart, hourEnd);

    if (tradeIds.length === 0) return true;

    // Fetch trade details
    const pipeline = redis.pipeline();
    tradeIds.forEach(id => pipeline.get(`trades:${id}`));
    const results = await pipeline.exec();

    const trades = results
      ?.filter(([err, data]) => !err && data)
      .map(([_, data]) => JSON.parse(data as string)) || [];

    if (trades.length === 0) return true;

    // Calculate aggregates
    let open = trades[0].price;
    let close = trades[trades.length - 1].price;
    let high = Math.max(...trades.map(t => t.price));
    let low = Math.min(...trades.map(t => t.price));
    let volume = trades.reduce((sum, t) => sum + t.size, 0);
    let buyVolume = trades.filter(t => t.side === 'BUY').reduce((sum, t) => sum + t.size, 0);
    let sellVolume = trades.filter(t => t.side === 'SELL').reduce((sum, t) => sum + t.size, 0);
    let largeTradeCount = trades.filter(t => t.isLarge).length;
    let avgPrice = trades.reduce((sum, t) => sum + t.price, 0) / trades.length;
    let avgSize = volume / trades.length;

    const aggregated: AggregatedData = {
      coin,
      timestamp: hourStart,
      interval: 'hourly',
      open,
      high,
      low,
      close,
      volume,
      buyVolume,
      sellVolume,
      tradeCount: trades.length,
      largeTradeCount,
      avgPrice,
      avgSize,
    };

    // Store aggregated data
    const key = `${HOURLY_PREFIX}${coin}:${hourStart}`;
    await redis.set(
      key,
      JSON.stringify(aggregated),
      'EX',
      HOURLY_RETENTION_DAYS * 24 * 60 * 60
    );

    // Add to sorted set for easy querying
    const listKey = `${HOURLY_PREFIX}list:${coin}`;
    await redis.zadd(listKey, hourStart, key);
    await redis.expire(listKey, HOURLY_RETENTION_DAYS * 24 * 60 * 60);

    return true;
  } catch (error) {
    console.error('Error aggregating to hourly:', error);
    return false;
  }
}

/**
 * Aggregate hourly data into daily data
 */
export async function aggregateToDaily(coin: string, startTime: number, endTime: number): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  try {
    // Round to day boundaries
    const dayStart = Math.floor(startTime / 86400000) * 86400000;
    const dayEnd = Math.floor(endTime / 86400000) * 86400000;

    // Get hourly data for this day
    const hourlyListKey = `${HOURLY_PREFIX}list:${coin}`;
    const hourlyKeys = await redis.zrangebyscore(hourlyListKey, dayStart, dayEnd);

    if (hourlyKeys.length === 0) return true;

    // Fetch hourly data
    const pipeline = redis.pipeline();
    hourlyKeys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();

    const hourlyData = results
      ?.filter(([err, data]) => !err && data)
      .map(([_, data]) => JSON.parse(data as string)) || [];

    if (hourlyData.length === 0) return true;

    // Calculate daily aggregates
    const open = hourlyData[0].open;
    const close = hourlyData[hourlyData.length - 1].close;
    const high = Math.max(...hourlyData.map(h => h.high));
    const low = Math.min(...hourlyData.map(h => h.low));
    const volume = hourlyData.reduce((sum, h) => sum + h.volume, 0);
    const buyVolume = hourlyData.reduce((sum, h) => sum + h.buyVolume, 0);
    const sellVolume = hourlyData.reduce((sum, h) => sum + h.sellVolume, 0);
    const tradeCount = hourlyData.reduce((sum, h) => sum + h.tradeCount, 0);
    const largeTradeCount = hourlyData.reduce((sum, h) => sum + h.largeTradeCount, 0);
    const avgPrice = hourlyData.reduce((sum, h) => sum + h.avgPrice * h.tradeCount, 0) / tradeCount;
    const avgSize = volume / tradeCount;

    const aggregated: AggregatedData = {
      coin,
      timestamp: dayStart,
      interval: 'daily',
      open,
      high,
      low,
      close,
      volume,
      buyVolume,
      sellVolume,
      tradeCount,
      largeTradeCount,
      avgPrice,
      avgSize,
    };

    // Store aggregated data
    const key = `${DAILY_PREFIX}${coin}:${dayStart}`;
    await redis.set(
      key,
      JSON.stringify(aggregated),
      'EX',
      DAILY_RETENTION_DAYS * 24 * 60 * 60
    );

    // Add to sorted set
    const listKey = `${DAILY_PREFIX}list:${coin}`;
    await redis.zadd(listKey, dayStart, key);
    await redis.expire(listKey, DAILY_RETENTION_DAYS * 24 * 60 * 60);

    return true;
  } catch (error) {
    console.error('Error aggregating to daily:', error);
    return false;
  }
}

/**
 * Get aggregated data for a time range
 */
export async function getAggregatedData(
  coin: string,
  startTime: number,
  endTime: number,
  interval: 'hourly' | 'daily'
): Promise<AggregatedData[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const prefix = interval === 'hourly' ? HOURLY_PREFIX : DAILY_PREFIX;
    const listKey = `${prefix}list:${coin}`;

    const keys = await redis.zrangebyscore(listKey, startTime, endTime);

    if (keys.length === 0) return [];

    const pipeline = redis.pipeline();
    keys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();

    const data = results
      ?.filter(([err, data]) => !err && data)
      .map(([_, data]) => JSON.parse(data as string)) || [];

    return data;
  } catch (error) {
    console.error('Error getting aggregated data:', error);
    return [];
  }
}

/**
 * Cleanup old raw trades (older than 7 days)
 */
export async function cleanupOldRawTrades(coin: string): Promise<void> {
  if (!isRedisAvailable() || !redis) return;

  try {
    const cutoffTime = Date.now() - (RAW_TRADES_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const tradesListKey = `trades:list:${coin}`;

    // Get IDs of old trades
    const oldTradeIds = await redis.zrangebyscore(tradesListKey, '-inf', cutoffTime);

    if (oldTradeIds.length === 0) return;

    // Delete old trade data
    const pipeline = redis.pipeline();
    oldTradeIds.forEach(id => pipeline.del(`trades:${id}`));
    await pipeline.exec();

    // Remove from sorted set
    await redis.zremrangebyscore(tradesListKey, '-inf', cutoffTime);

    console.log(`Cleaned up ${oldTradeIds.length} old trades for ${coin}`);
  } catch (error) {
    console.error('Error cleaning up old trades:', error);
  }
}

/**
 * Run full aggregation pipeline for a coin
 */
export async function runAggregationPipeline(coin: string): Promise<void> {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Aggregate to hourly (last 24 hours)
  for (let time = oneDayAgo; time < now; time += 3600000) {
    await aggregateToHourly(coin, time, time + 3600000);
  }

  // Aggregate to daily (last 7 days)
  for (let time = oneWeekAgo; time < now; time += 86400000) {
    await aggregateToDaily(coin, time, time + 86400000);
  }

  // Cleanup old raw trades
  await cleanupOldRawTrades(coin);
}
