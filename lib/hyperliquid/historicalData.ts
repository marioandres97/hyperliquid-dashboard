/**
 * Historical Data Fetching and Caching
 * 
 * Fetches 24-hour historical candle data for sparklines
 * with 1-hour intervals and caching
 */

import { getCandleSnapshot } from './client';

interface CachedHistoricalData {
  data: number[];
  timestamp: number;
}

// In-memory cache for historical data (1 hour TTL)
const historicalDataCache = new Map<string, CachedHistoricalData>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch 24-hour historical data with 1-hour intervals
 * Returns array of closing prices for sparkline
 */
export async function fetch24HourData(coin: string): Promise<number[]> {
  const cacheKey = `sparkline-${coin}`;
  
  // Check cache first
  const cached = historicalDataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.debug(`Using cached historical data for ${coin}`, {
      age: Math.floor((Date.now() - cached.timestamp) / 1000) + 's',
    });
    return cached.data;
  }

  try {
    // Calculate time range (last 24 hours)
    const endTime = Date.now();
    const startTime = endTime - (24 * 60 * 60 * 1000); // 24 hours ago

    console.debug(`Fetching 24h historical data for ${coin}`, {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    });

    // Fetch candle data with 1-hour intervals
    const response = await getCandleSnapshot(
      coin,
      '1h', // 1 hour interval
      startTime,
      endTime
    );

    if (!response || !Array.isArray(response)) {
      console.warn(`Invalid response for ${coin} historical data`, { response });
      return [];
    }

    // Extract closing prices from candles
    const prices: number[] = response.map((candle: any) => {
      // Candle format: {t: timestamp, o: open, h: high, l: low, c: close, v: volume}
      return parseFloat(candle.c || candle.close || 0);
    }).filter((price: number) => price > 0);

    console.info(`Fetched ${prices.length} data points for ${coin}`, {
      first: prices[0],
      last: prices[prices.length - 1],
    });

    // Cache the result
    historicalDataCache.set(cacheKey, {
      data: prices,
      timestamp: Date.now(),
    });

    return prices;
  } catch (error) {
    console.error(`Error fetching 24h data for ${coin}`, error);
    
    // Return cached data even if expired, better than nothing
    if (cached) {
      console.warn(`Using expired cache for ${coin} due to error`);
      return cached.data;
    }
    
    return [];
  }
}

/**
 * Fetch historical data for multiple coins
 */
export async function fetchMultiCoin24HourData(
  coins: string[]
): Promise<Record<string, number[]>> {
  const results: Record<string, number[]> = {};

  await Promise.all(
    coins.map(async (coin) => {
      results[coin] = await fetch24HourData(coin);
    })
  );

  return results;
}

/**
 * Clear cache for a specific coin or all coins
 */
export function clearHistoricalDataCache(coin?: string): void {
  if (coin) {
    historicalDataCache.delete(`sparkline-${coin}`);
    console.debug(`Cleared historical data cache for ${coin}`);
  } else {
    historicalDataCache.clear();
    console.debug('Cleared all historical data cache');
  }
}

/**
 * Get cache status for debugging
 */
export function getHistoricalDataCacheStatus(): {
  entries: number;
  coins: string[];
  ages: Record<string, number>;
} {
  const entries = historicalDataCache.size;
  const coins: string[] = [];
  const ages: Record<string, number> = {};

  historicalDataCache.forEach((value, key) => {
    const coin = key.replace('sparkline-', '');
    coins.push(coin);
    ages[coin] = Math.floor((Date.now() - value.timestamp) / 1000); // age in seconds
  });

  return { entries, coins, ages };
}
