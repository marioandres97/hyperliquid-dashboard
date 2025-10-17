// Storage service for persisting flow data to Redis

import {
  Coin,
  TimeWindow,
  FlowData,
  StoredFlowData,
  LiquidityNode,
  FlowTimePoint,
} from '../types';

/**
 * Storage service for flow data persistence
 * This is a client-side interface - actual Redis operations happen server-side
 */
export class FlowStorageService {
  private readonly baseKey = 'liquidity-flow';
  private readonly defaultTTL = 4 * 60 * 60; // 4 hours in seconds

  /**
   * Generate storage key for flow data
   */
  private getKey(coin: Coin, timeWindow: TimeWindow, timestamp: number): string {
    const roundedTimestamp = this.roundTimestamp(timestamp, timeWindow);
    return `${this.baseKey}:${coin}:${timeWindow}:${roundedTimestamp}`;
  }

  /**
   * Round timestamp to time window boundary
   */
  private roundTimestamp(timestamp: number, timeWindow: TimeWindow): number {
    const windowMs = this.getWindowMs(timeWindow);
    return Math.floor(timestamp / windowMs) * windowMs;
  }

  /**
   * Get time window in milliseconds
   */
  private getWindowMs(timeWindow: TimeWindow): number {
    const map: Record<TimeWindow, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
    };
    return map[timeWindow];
  }

  /**
   * Serialize flow data for storage
   */
  private serializeFlowData(data: FlowData): StoredFlowData {
    const timestamp = Date.now();
    const key = this.getKey(data.coin, data.timeWindow, timestamp);

    // Convert Map to Array for JSON serialization
    const nodes = Array.from(data.nodes.entries());

    // Extract time series from metrics (if we have trade data)
    const timeSeries: FlowTimePoint[] = [];
    // Time series would be generated separately if needed

    return {
      key,
      coin: data.coin,
      timeWindow: data.timeWindow,
      timestamp,
      data: {
        nodes,
        metrics: data.metrics,
        timeSeries,
      },
      expiresAt: timestamp + this.defaultTTL * 1000,
    };
  }

  /**
   * Deserialize stored flow data
   */
  private deserializeFlowData(stored: StoredFlowData): Partial<FlowData> {
    // Convert Array back to Map
    const nodes = new Map<number, LiquidityNode>(stored.data.nodes);

    return {
      coin: stored.coin,
      timeWindow: stored.timeWindow,
      startTime: stored.timestamp - this.getWindowMs(stored.timeWindow),
      endTime: stored.timestamp,
      nodes,
      metrics: stored.data.metrics,
      trades: [], // Not stored, would need to fetch separately if needed
      liquidations: [], // Not stored, would need to fetch separately if needed
    };
  }

  /**
   * Save flow data (client-side - would call API)
   */
  async saveFlowData(data: FlowData): Promise<void> {
    const stored = this.serializeFlowData(data);
    
    try {
      // Call API to store in Redis
      const response = await fetch('/api/liquidity-flow/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stored),
      });

      if (!response.ok) {
        throw new Error(`Storage failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[FlowStorage] Save error:', error);
      throw error;
    }
  }

  /**
   * Retrieve flow data (client-side - would call API)
   */
  async getFlowData(
    coin: Coin,
    timeWindow: TimeWindow,
    timestamp?: number
  ): Promise<Partial<FlowData> | null> {
    try {
      const ts = timestamp || Date.now();
      const key = this.getKey(coin, timeWindow, ts);

      const response = await fetch(
        `/api/liquidity-flow/retrieve?key=${encodeURIComponent(key)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Retrieval failed: ${response.statusText}`);
      }

      const stored: StoredFlowData = await response.json();
      return this.deserializeFlowData(stored);
    } catch (error) {
      console.error('[FlowStorage] Retrieve error:', error);
      return null;
    }
  }

  /**
   * Get historical flow data for a time range
   */
  async getHistoricalFlowData(
    coin: Coin,
    timeWindow: TimeWindow,
    startTime: number,
    endTime: number
  ): Promise<Partial<FlowData>[]> {
    try {
      const response = await fetch(
        `/api/liquidity-flow/historical?coin=${coin}&timeWindow=${timeWindow}&start=${startTime}&end=${endTime}`
      );

      if (!response.ok) {
        throw new Error(`Historical retrieval failed: ${response.statusText}`);
      }

      const storedData: StoredFlowData[] = await response.json();
      return storedData.map(stored => this.deserializeFlowData(stored));
    } catch (error) {
      console.error('[FlowStorage] Historical retrieve error:', error);
      return [];
    }
  }

  /**
   * Delete flow data
   */
  async deleteFlowData(coin: Coin, timeWindow: TimeWindow, timestamp: number): Promise<void> {
    try {
      const key = this.getKey(coin, timeWindow, timestamp);

      const response = await fetch('/api/liquidity-flow/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        throw new Error(`Deletion failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[FlowStorage] Delete error:', error);
      throw error;
    }
  }

  /**
   * Clear all flow data for a coin
   */
  async clearCoin(coin: Coin): Promise<void> {
    try {
      const response = await fetch(`/api/liquidity-flow/clear/${coin}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Clear failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[FlowStorage] Clear error:', error);
      throw error;
    }
  }
}

// Singleton instance
let storageInstance: FlowStorageService | null = null;

/**
 * Get the global flow storage service instance
 */
export function getFlowStorage(): FlowStorageService {
  if (!storageInstance) {
    storageInstance = new FlowStorageService();
  }
  return storageInstance;
}

/**
 * Redis storage schema documentation
 * 
 * Keys:
 * - liquidity-flow:{coin}:{timeWindow}:{timestamp} - Flow data snapshots
 * 
 * TTL:
 * - 1m windows: 1 hour
 * - 5m windows: 4 hours
 * - 15m windows: 12 hours
 * - 1h windows: 24 hours
 * - 4h windows: 7 days
 * 
 * Data Structure (JSON):
 * {
 *   key: string,
 *   coin: string,
 *   timeWindow: string,
 *   timestamp: number,
 *   data: {
 *     nodes: [[price, LiquidityNode], ...],
 *     metrics: FlowMetrics,
 *     timeSeries: FlowTimePoint[]
 *   },
 *   expiresAt: number
 * }
 */
