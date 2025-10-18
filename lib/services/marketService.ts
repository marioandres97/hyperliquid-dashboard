/**
 * Market Service
 * 
 * Handles interactions with the Hyperliquid API for market data.
 */

import { config } from '@/lib/core/config';
import { HyperliquidAPIError, ValidationError } from '@/lib/core/errors';
import { log } from '@/lib/core/logger';
import { cacheService } from '@/lib/services/cacheService';

export interface Trade {
  timestamp: number;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
}

export interface Price {
  asset: string;
  price: number;
  timestamp: number;
}

// Valid assets
const VALID_ASSETS = ['BTC', 'ETH', 'HYPE'] as const;
export type Asset = typeof VALID_ASSETS[number];

/**
 * Market Service Class
 */
export class MarketService {
  private apiUrl: string;
  private timeout: number;

  constructor() {
    this.apiUrl = config.hyperliquid.apiUrl;
    this.timeout = config.hyperliquid.timeout;
  }

  /**
   * Validate asset name
   */
  validateAsset(asset: string): asserts asset is Asset {
    if (!VALID_ASSETS.includes(asset as Asset)) {
      throw new ValidationError(
        `Invalid asset: ${asset}. Must be one of: ${VALID_ASSETS.join(', ')}`,
        { asset, validAssets: VALID_ASSETS }
      );
    }
  }

  /**
   * Get current price for an asset
   */
  async getPrice(asset: string): Promise<Price> {
    this.validateAsset(asset);
    
    // Use cache with 10s TTL in both memory and redis
    return cacheService.get(
      `market:${asset}:price`,
      async () => {
        const timer = log.startTimer({ asset, operation: 'getPrice' });
        
        try {
          log.debug('Fetching price from Hyperliquid', { asset });

          const response = await fetch(`${this.apiUrl}/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'l2Book', coin: asset }),
            signal: AbortSignal.timeout(this.timeout),
          });

          if (!response.ok) {
            throw new HyperliquidAPIError(
              `Failed to fetch price for ${asset}: ${response.statusText}`,
              { asset, status: response.status, statusText: response.statusText }
            );
          }

          const data = await response.json();

          if (!data || !data.levels || !data.levels[0] || !data.levels[0][0]) {
            throw new HyperliquidAPIError(
              `Invalid price data received for ${asset}`,
              { asset, data }
            );
          }

          const price = parseFloat(data.levels[0][0].px);
          
          timer.done('Price fetched successfully', { asset, price });

          return {
            asset,
            price,
            timestamp: Date.now(),
          };
        } catch (error) {
          if (error instanceof ValidationError || error instanceof HyperliquidAPIError) {
            throw error;
          }

          log.error('Failed to fetch price', error, { asset });
          
          throw new HyperliquidAPIError(
            `Failed to fetch price for ${asset}`,
            { asset, error: error instanceof Error ? error.message : String(error) }
          );
        }
      },
      { ttl: 10, layer: 'both' }
    );
  }

  /**
   * Get recent trades for an asset
   */
  async getTrades(asset: string, limit: number = 100): Promise<Trade[]> {
    this.validateAsset(asset);
    
    if (limit <= 0 || limit > 1000) {
      throw new ValidationError(
        'Limit must be between 1 and 1000',
        { limit, asset }
      );
    }

    // Use cache with 30s TTL in both memory and redis
    return cacheService.get(
      `market:${asset}:trades:${limit}`,
      async () => {
        const timer = log.startTimer({ asset, limit, operation: 'getTrades' });
        
        try {
          log.debug('Fetching trades from Hyperliquid', { asset, limit });

          const response = await fetch(`${this.apiUrl}/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              type: 'candleSnapshot',
              req: {
                coin: asset,
                interval: '1m',
                startTime: Date.now() - (24 * 60 * 60 * 1000), // Last 24 hours
              }
            }),
            signal: AbortSignal.timeout(this.timeout),
          });

          if (!response.ok) {
            throw new HyperliquidAPIError(
              `Failed to fetch trades for ${asset}: ${response.statusText}`,
              { asset, status: response.status, statusText: response.statusText }
            );
          }

          const data = await response.json();

          if (!Array.isArray(data)) {
            throw new HyperliquidAPIError(
              `Invalid trades data received for ${asset}`,
              { asset, data }
            );
          }

          // Transform candle data to trade format (simplified)
          const trades: Trade[] = data.slice(0, limit).map((candle: any) => ({
            timestamp: candle.t || Date.now(),
            side: parseFloat(candle.c) > parseFloat(candle.o) ? 'BUY' : 'SELL',
            size: parseFloat(candle.v || 0),
            price: parseFloat(candle.c || 0),
          }));

          timer.done('Trades fetched successfully', { asset, count: trades.length });

          return trades;
        } catch (error) {
          if (error instanceof ValidationError || error instanceof HyperliquidAPIError) {
            throw error;
          }

          log.error('Failed to fetch trades', error, { asset, limit });
          
          throw new HyperliquidAPIError(
            `Failed to fetch trades for ${asset}`,
            { asset, limit, error: error instanceof Error ? error.message : String(error) }
          );
        }
      },
      { ttl: 30, layer: 'both' }
    );
  }
}

// Export singleton instance
export const marketService = new MarketService();
