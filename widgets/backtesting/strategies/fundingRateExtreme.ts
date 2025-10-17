import { BaseStrategy } from './baseStrategy';
import { Signal, MarketData, Position } from '../types';

/**
 * Funding Rate Extremes Strategy
 * 
 * Logic:
 * - Entry: When funding rate exceeds extreme thresholds (>0.05% hourly = very positive)
 * - Direction: SHORT when funding is extremely positive (expecting mean reversion)
 *             LONG when funding is extremely negative (expecting mean reversion)
 * - Exit: When funding normalizes or price hits TP/SL
 * - Timeframe: 1h candles
 * - Expected hold time: 4-24 hours
 */
export class FundingRateExtremeStrategy extends BaseStrategy {
  private readonly EXTREME_POSITIVE_THRESHOLD = 0.0005; // 0.05% hourly (18.25% APR)
  private readonly EXTREME_NEGATIVE_THRESHOLD = -0.0005; // -0.05% hourly
  private readonly NORMALIZATION_THRESHOLD = 0.0001; // 0.01% hourly (normal range)
  private readonly MIN_DURATION = 3; // Minimum hours funding must be extreme

  constructor() {
    super(
      'Funding Rate Extremes',
      'Mean reversion strategy trading extreme funding rate conditions'
    );
  }

  generateSignals(
    marketData: MarketData,
    currentIndex: number,
    openPositions: Position[]
  ): Signal[] {
    const signals: Signal[] = [];
    
    if (currentIndex < 0 || currentIndex >= marketData.candles.length) {
      return signals;
    }

    const currentCandle = marketData.candles[currentIndex];
    const currentTime = currentCandle.timestamp;
    const coin = marketData.candles[0]?.close ? 'BTC' : 'UNKNOWN'; // Simplified

    // Get recent funding rates
    const recentFundingRates = marketData.fundingRates.filter(
      fr => fr.timestamp <= currentTime && fr.timestamp > currentTime - (12 * 60 * 60 * 1000) // Last 12 hours
    );

    if (recentFundingRates.length < this.MIN_DURATION) {
      return signals;
    }

    // Calculate average recent funding rate
    const avgFundingRate = this.average(recentFundingRates.map(fr => fr.rate));
    const currentFundingRate = recentFundingRates[recentFundingRates.length - 1]?.rate || 0;

    // Check if we have an open position
    const openPosition = openPositions.find(pos => pos.coin === coin);

    if (openPosition) {
      // Check for exit signals
      if (this.shouldExit(openPosition, avgFundingRate, currentFundingRate)) {
        signals.push({
          timestamp: currentTime,
          coin,
          type: 'exit',
          direction: openPosition.side,
          confidence: 0.8,
          reason: 'Funding rate normalized',
          metadata: {
            fundingRate: currentFundingRate,
            avgFundingRate
          }
        });
      }
    } else {
      // Check for entry signals
      
      // Extreme positive funding -> SHORT (market is overleveraged long)
      if (avgFundingRate > this.EXTREME_POSITIVE_THRESHOLD) {
        const extremeDuration = this.countConsecutiveExtreme(
          recentFundingRates,
          this.EXTREME_POSITIVE_THRESHOLD,
          'positive'
        );

        if (extremeDuration >= this.MIN_DURATION) {
          const confidence = Math.min(
            0.6 + (avgFundingRate / this.EXTREME_POSITIVE_THRESHOLD) * 0.2,
            0.95
          );

          signals.push({
            timestamp: currentTime,
            coin,
            type: 'entry',
            direction: 'short',
            confidence,
            reason: `Extreme positive funding: ${(avgFundingRate * 100).toFixed(4)}% hourly`,
            metadata: {
              fundingRate: currentFundingRate,
              avgFundingRate,
              extremeDuration
            }
          });
        }
      }
      
      // Extreme negative funding -> LONG (market is overleveraged short)
      else if (avgFundingRate < this.EXTREME_NEGATIVE_THRESHOLD) {
        const extremeDuration = this.countConsecutiveExtreme(
          recentFundingRates,
          this.EXTREME_NEGATIVE_THRESHOLD,
          'negative'
        );

        if (extremeDuration >= this.MIN_DURATION) {
          const confidence = Math.min(
            0.6 + (Math.abs(avgFundingRate) / Math.abs(this.EXTREME_NEGATIVE_THRESHOLD)) * 0.2,
            0.95
          );

          signals.push({
            timestamp: currentTime,
            coin,
            type: 'entry',
            direction: 'long',
            confidence,
            reason: `Extreme negative funding: ${(avgFundingRate * 100).toFixed(4)}% hourly`,
            metadata: {
              fundingRate: currentFundingRate,
              avgFundingRate,
              extremeDuration
            }
          });
        }
      }
    }

    return signals;
  }

  /**
   * Check if position should be exited
   */
  private shouldExit(
    position: Position,
    avgFundingRate: number,
    currentFundingRate: number
  ): boolean {
    // Exit when funding rate normalizes
    const isNormalized = Math.abs(avgFundingRate) < this.NORMALIZATION_THRESHOLD;
    
    // Exit if funding reverses dramatically
    const hasReversed = position.side === 'short' 
      ? currentFundingRate < 0 
      : currentFundingRate > 0;

    return isNormalized || hasReversed;
  }

  /**
   * Count consecutive hours with extreme funding
   */
  private countConsecutiveExtreme(
    fundingRates: Array<{ timestamp: number; rate: number }>,
    threshold: number,
    direction: 'positive' | 'negative'
  ): number {
    let count = 0;
    
    // Start from most recent
    for (let i = fundingRates.length - 1; i >= 0; i--) {
      const rate = fundingRates[i].rate;
      
      if (direction === 'positive' && rate > threshold) {
        count++;
      } else if (direction === 'negative' && rate < threshold) {
        count++;
      } else {
        break; // Stop at first non-extreme rate
      }
    }

    return count;
  }
}
