import { Candle, FundingRate, OpenInterest, Liquidation } from '../types';

export class HyperliquidHistoricalService {
  private readonly API_URL = 'https://api.hyperliquid.xyz/info';
  private readonly RATE_LIMIT_DELAY = 100; // ms between requests
  private requestQueue: Promise<any> = Promise.resolve();

  /**
   * Rate-limited fetch wrapper
   */
  private async rateLimitedFetch<T>(fetchFn: () => Promise<T>): Promise<T> {
    this.requestQueue = this.requestQueue.then(async () => {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY));
      return fetchFn();
    });
    return this.requestQueue;
  }

  /**
   * Fetch candle data from Hyperliquid API
   */
  async fetchCandles(
    coin: string,
    interval: string,
    startTime: number,
    endTime: number
  ): Promise<Candle[]> {
    try {
      const response = await this.rateLimitedFetch(async () => {
        const res = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'candleSnapshot',
            req: {
              coin,
              interval,
              startTime,
              endTime
            }
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
      });

      // Transform API response to our Candle format
      if (Array.isArray(response)) {
        return response.map((candle: any) => ({
          timestamp: candle.t || candle.T || candle.timestamp,
          open: parseFloat(candle.o || candle.open),
          high: parseFloat(candle.h || candle.high),
          low: parseFloat(candle.l || candle.low),
          close: parseFloat(candle.c || candle.close),
          volume: parseFloat(candle.v || candle.volume || 0)
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching candles:', error);
      return [];
    }
  }

  /**
   * Fetch funding rate history
   */
  async fetchFundingRates(
    coin: string,
    startTime: number,
    endTime: number
  ): Promise<FundingRate[]> {
    try {
      const response = await this.rateLimitedFetch(async () => {
        const res = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'fundingHistory',
            req: {
              coin,
              startTime
            }
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
      });

      // Transform and filter by endTime
      if (Array.isArray(response)) {
        return response
          .filter((fr: any) => {
            const time = fr.time || fr.timestamp;
            return time >= startTime && time <= endTime;
          })
          .map((fr: any) => ({
            timestamp: fr.time || fr.timestamp,
            rate: parseFloat(fr.fundingRate || fr.rate || 0),
            coin
          }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching funding rates:', error);
      return [];
    }
  }

  /**
   * Fetch current Open Interest snapshot
   * Note: Historical OI is limited, so we'll need to derive or use periodic snapshots
   */
  async fetchOpenInterest(coin: string): Promise<number> {
    try {
      const response = await this.rateLimitedFetch(async () => {
        const res = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'metaAndAssetCtxs'
          })
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
      });

      // Find the specific coin's OI
      if (Array.isArray(response)) {
        for (const asset of response) {
          if (asset.name === coin || asset.coin === coin) {
            return parseFloat(asset.openInterest || asset.oi || 0);
          }
        }
      }

      return 0;
    } catch (error) {
      console.error('Error fetching open interest:', error);
      return 0;
    }
  }

  /**
   * Simulate historical OI from volume and price data
   * This is a approximation since true historical OI may not be available
   */
  simulateHistoricalOI(
    candles: Candle[],
    currentOI: number
  ): OpenInterest[] {
    if (candles.length === 0) return [];

    const oiData: OpenInterest[] = [];
    const coin = 'BTC'; // Simplified

    // Use volume as a proxy for OI changes
    // Higher volume often correlates with OI expansion
    const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;

    // Start with current OI and work backwards
    let estimatedOI = currentOI;

    for (let i = candles.length - 1; i >= 0; i--) {
      const candle = candles[i];
      const volumeRatio = candle.volume / avgVolume;
      
      // Adjust OI based on volume (simplified model)
      // High volume suggests OI changes
      const oiChange = (volumeRatio - 1) * 0.02; // 2% change per volume ratio unit
      
      oiData.unshift({
        timestamp: candle.timestamp,
        value: estimatedOI,
        coin
      });

      // Adjust for next iteration (going backwards)
      estimatedOI = estimatedOI / (1 + oiChange);
    }

    return oiData;
  }

  /**
   * Parse liquidation data from CSV or API
   * For MVP, we'll return mock data structure
   */
  async fetchLiquidations(
    coin: string,
    startTime: number,
    endTime: number
  ): Promise<Liquidation[]> {
    // In production, this would:
    // 1. Fetch from Hyperliquid's historical data repo
    // 2. Parse CSV files
    // 3. Filter by time range
    
    // For MVP, return empty array (can be populated with real data later)
    console.warn('Liquidation data not available - using empty dataset');
    return [];
  }

  /**
   * Fetch all market data for backtesting
   */
  async fetchMarketData(
    coin: string,
    interval: string,
    startTime: number,
    endTime: number
  ): Promise<{
    candles: Candle[];
    fundingRates: FundingRate[];
    openInterest: OpenInterest[];
    liquidations: Liquidation[];
  }> {
    console.log(`Fetching market data for ${coin} from ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`);

    // Fetch all data in parallel
    const [candles, fundingRates, currentOI, liquidations] = await Promise.all([
      this.fetchCandles(coin, interval, startTime, endTime),
      this.fetchFundingRates(coin, startTime, endTime),
      this.fetchOpenInterest(coin),
      this.fetchLiquidations(coin, startTime, endTime)
    ]);

    // Simulate historical OI from candles
    const openInterest = this.simulateHistoricalOI(candles, currentOI);

    console.log(`Fetched ${candles.length} candles, ${fundingRates.length} funding rates, ${openInterest.length} OI points, ${liquidations.length} liquidations`);

    return {
      candles,
      fundingRates,
      openInterest,
      liquidations
    };
  }
}
