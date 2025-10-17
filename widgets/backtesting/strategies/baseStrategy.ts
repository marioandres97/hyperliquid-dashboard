import { Signal, MarketData, Candle, Position } from '../types';

export abstract class BaseStrategy {
  protected name: string;
  protected description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get strategy description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Generate trading signals from market data
   * Must be implemented by each strategy
   */
  abstract generateSignals(
    marketData: MarketData,
    currentIndex: number,
    openPositions: Position[]
  ): Signal[];

  /**
   * Helper: Calculate Simple Moving Average
   */
  protected calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  /**
   * Helper: Calculate Exponential Moving Average
   */
  protected calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Helper: Calculate price change percentage
   */
  protected calculatePriceChange(currentPrice: number, previousPrice: number): number {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  /**
   * Helper: Calculate volume change percentage
   */
  protected calculateVolumeChange(currentVolume: number, avgVolume: number): number {
    if (avgVolume === 0) return 0;
    return ((currentVolume - avgVolume) / avgVolume) * 100;
  }

  /**
   * Helper: Get recent candles
   */
  protected getRecentCandles(candles: Candle[], currentIndex: number, lookback: number): Candle[] {
    const startIndex = Math.max(0, currentIndex - lookback);
    return candles.slice(startIndex, currentIndex + 1);
  }

  /**
   * Helper: Calculate average from array
   */
  protected average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Helper: Calculate standard deviation
   */
  protected standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const avg = this.average(values);
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const variance = this.average(squaredDiffs);
    
    return Math.sqrt(variance);
  }

  /**
   * Helper: Check if we should exit based on opposite signal
   */
  protected shouldExitPosition(
    position: Position,
    signal: Signal
  ): boolean {
    // Exit long if we get a short signal, and vice versa
    return (
      position.coin === signal.coin &&
      position.side !== signal.direction &&
      signal.type === 'entry'
    );
  }
}
