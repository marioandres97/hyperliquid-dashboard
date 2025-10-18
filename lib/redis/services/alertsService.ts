import redis, { isRedisAvailable } from '@/lib/redis';

export type AlertType = 'price' | 'volume' | 'position' | 'trade' | 'liquidation' | 'funding';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface StoredAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  coin: string;
  timestamp: number;
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  dismissed: boolean;
}

const ALERTS_KEY_PREFIX = 'alerts:';
const ALERTS_LIST = 'alerts:list';
const ALERTS_RETENTION_DAYS = parseInt(process.env.REDIS_ALERTS_RETENTION || '365');

export async function storeAlert(alert: StoredAlert): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  try {
    const key = `${ALERTS_KEY_PREFIX}${alert.id}`;
    
    await redis.set(key, JSON.stringify(alert), 'EX', ALERTS_RETENTION_DAYS * 24 * 60 * 60);
    await redis.zadd(ALERTS_LIST, alert.timestamp, alert.id);
    await redis.expire(ALERTS_LIST, ALERTS_RETENTION_DAYS * 24 * 60 * 60);
    
    return true;
  } catch (error) {
    console.error('Error storing alert:', error);
    return false;
  }
}

export async function getAlerts(
  startTime?: number,
  endTime?: number,
  limit: number = 100
): Promise<StoredAlert[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const start = startTime || '-inf';
    const end = endTime || '+inf';
    
    const alertIds = await redis.zrangebyscore(ALERTS_LIST, start, end, 'LIMIT', 0, limit);
    
    if (alertIds.length === 0) return [];
    
    const pipeline = redis.pipeline();
    alertIds.forEach(id => pipeline.get(`${ALERTS_KEY_PREFIX}${id}`));
    const results = await pipeline.exec();
    
    const alerts: StoredAlert[] = [];
    results?.forEach(([err, data]) => {
      if (!err && data) {
        alerts.push(JSON.parse(data as string));
      }
    });
    
    return alerts.reverse(); // Most recent first
  } catch (error) {
    console.error('Error getting alerts:', error);
    return [];
  }
}

export async function getAlertsByCoin(
  coin: string,
  limit: number = 50
): Promise<StoredAlert[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const allAlerts = await getAlerts(undefined, undefined, 500);
    return allAlerts.filter(alert => alert.coin === coin).slice(0, limit);
  } catch (error) {
    console.error('Error getting alerts by coin:', error);
    return [];
  }
}

export async function dismissAlert(alertId: string): Promise<boolean> {
  if (!isRedisAvailable() || !redis) return false;

  try {
    const key = `${ALERTS_KEY_PREFIX}${alertId}`;
    const alertData = await redis.get(key);
    
    if (!alertData) return false;
    
    const alert = JSON.parse(alertData as string);
    alert.dismissed = true;
    
    await redis.set(key, JSON.stringify(alert));
    return true;
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return false;
  }
}

export async function getActiveAlerts(limit: number = 50): Promise<StoredAlert[]> {
  if (!isRedisAvailable() || !redis) return [];

  try {
    const allAlerts = await getAlerts(undefined, undefined, 200);
    return allAlerts.filter(alert => !alert.dismissed).slice(0, limit);
  } catch (error) {
    console.error('Error getting active alerts:', error);
    return [];
  }
}
