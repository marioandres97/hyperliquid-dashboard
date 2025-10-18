import redis, { isRedisAvailable } from '@/lib/redis';

export interface OrderBookSnapshot {
  coin: string;
  timestamp: number;
  bids: Array<{ price: number; volume: number }>;
  asks: Array<{ price: number; volume: number }>;
  midPrice: number;
  spread: number;
  imbalance: number;
}

const ORDERBOOK_SNAPSHOT_PREFIX = 'orderbook:snapshot:';
const ORDERBOOK_SNAPSHOTS_LIST = 'orderbook:snapshots:list:';
const ORDERBOOK_RETENTION_DAYS = parseInt(process.env.REDIS_ORDERBOOK_RETENTION || '30');
const SNAPSHOT_INTERVAL_MINUTES = parseInt(process.env.ORDERBOOK_SNAPSHOT_INTERVAL || '5');

export async function storeOrderBookSnapshot(snapshot: OrderBookSnapshot): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  try {
    // Round timestamp to nearest snapshot interval
    const roundedTimestamp = Math.floor(snapshot.timestamp / (SNAPSHOT_INTERVAL_MINUTES * 60 * 1000)) * (SNAPSHOT_INTERVAL_MINUTES * 60 * 1000);
    
    const key = `${ORDERBOOK_SNAPSHOT_PREFIX}${snapshot.coin}:${roundedTimestamp}`;
    const listKey = `${ORDERBOOK_SNAPSHOTS_LIST}${snapshot.coin}`;
    
    await redis.set(key, JSON.stringify(snapshot), 'EX', ORDERBOOK_RETENTION_DAYS * 24 * 60 * 60);
    await redis.zadd(listKey, roundedTimestamp, key);
    await redis.expire(listKey, ORDERBOOK_RETENTION_DAYS * 24 * 60 * 60);
    
    return true;
  } catch (error) {
    console.error('Error storing orderbook snapshot:', error);
    return false;
  }
}

export async function getOrderBookSnapshots(
  coin: string,
  startTime: number,
  endTime: number,
  limit: number = 100
): Promise<OrderBookSnapshot[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const listKey = `${ORDERBOOK_SNAPSHOTS_LIST}${coin}`;
    const snapshotKeys = await redis.zrangebyscore(listKey, startTime, endTime, 'LIMIT', 0, limit);
    
    if (snapshotKeys.length === 0) return [];
    
    const pipeline = redis.pipeline();
    snapshotKeys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();
    
    const snapshots: OrderBookSnapshot[] = [];
    results?.forEach(([err, data]) => {
      if (!err && data) {
        snapshots.push(JSON.parse(data as string));
      }
    });
    
    return snapshots;
  } catch (error) {
    console.error('Error getting orderbook snapshots:', error);
    return [];
  }
}

export async function getLatestOrderBookSnapshot(coin: string): Promise<OrderBookSnapshot | null> {
  if (!isRedisAvailable() || !redis) return null;

  try {
    const listKey = `${ORDERBOOK_SNAPSHOTS_LIST}${coin}`;
    
    // Get the most recent snapshot key
    const latestKeys = await redis.zrevrange(listKey, 0, 0);
    
    if (latestKeys.length === 0) return null;
    
    const snapshotData = await redis.get(latestKeys[0]);
    
    if (!snapshotData) return null;
    
    return JSON.parse(snapshotData as string);
  } catch (error) {
    console.error('Error getting latest orderbook snapshot:', error);
    return null;
  }
}

export async function analyzeOrderBookHistory(
  coin: string,
  startTime: number,
  endTime: number
): Promise<{
  avgSpread: number;
  avgImbalance: number;
  maxSpread: number;
  minSpread: number;
  spreadVolatility: number;
}> {
  if (!isRedisAvailable() || !redis) {
    return {
      avgSpread: 0,
      avgImbalance: 0,
      maxSpread: 0,
      minSpread: 0,
      spreadVolatility: 0,
    };
  }

  try {
    const snapshots = await getOrderBookSnapshots(coin, startTime, endTime, 500);
    
    if (snapshots.length === 0) {
      return {
        avgSpread: 0,
        avgImbalance: 0,
        maxSpread: 0,
        minSpread: 0,
        spreadVolatility: 0,
      };
    }
    
    const spreads = snapshots.map(s => s.spread);
    const imbalances = snapshots.map(s => s.imbalance);
    
    const avgSpread = spreads.reduce((sum, s) => sum + s, 0) / spreads.length;
    const avgImbalance = imbalances.reduce((sum, i) => sum + i, 0) / imbalances.length;
    const maxSpread = Math.max(...spreads);
    const minSpread = Math.min(...spreads);
    
    // Calculate spread volatility (standard deviation)
    const variance = spreads.reduce((sum, s) => sum + Math.pow(s - avgSpread, 2), 0) / spreads.length;
    const spreadVolatility = Math.sqrt(variance);
    
    return {
      avgSpread,
      avgImbalance,
      maxSpread,
      minSpread,
      spreadVolatility,
    };
  } catch (error) {
    console.error('Error analyzing orderbook history:', error);
    return {
      avgSpread: 0,
      avgImbalance: 0,
      maxSpread: 0,
      minSpread: 0,
      spreadVolatility: 0,
    };
  }
}
