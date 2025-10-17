import { BaseStrategy } from './baseStrategy';
import { Signal, MarketData, Position } from '../types';

/**
 * Open Interest Expansion + Volume Spike Strategy
 * 
 * Logic:
 * - Entry: OI increases >10% AND volume spikes >2x average
 * - Direction: Follow the trend (price momentum direction)
 * - Exit: OI contracts or price reverses
 * - Timeframe: 1h candles
 * - Expected hold time: 2-12 hours
 */
export class OIExpansionStrategy extends BaseStrategy {
  private readonly OI_EXPANSION_THRESHOLD = 0.10; // 10% increase
  private readonly VOLUME_SPIKE_THRESHOLD = 2.0; // 2x average
  private readonly OI_CONTRACTION_THRESHOLD = -0.05; // -5% decrease
  private readonly LOOKBACK_PERIOD = 20; // candles for averages

  constructor() {
    super(
      'OI Expansion + Volume Spike',
      'Momentum strategy following significant OI and volume increases'
    );
  }

  generateSignals(
    marketData: MarketData,
    currentIndex: number,
    openPositions: Position[]
  ): Signal[] {
    const signals: Signal[] = [];
    
    if (currentIndex < this.LOOKBACK_PERIOD || currentIndex >= marketData.candles.length) {
      return signals;
    }

    const currentCandle = marketData.candles[currentIndex];
    const previousCandle = marketData.candles[currentIndex - 1];
    const currentTime = currentCandle.timestamp;
    const coin = 'BTC'; // Simplified

    // Calculate volume average
    const recentCandles = this.getRecentCandles(marketData.candles, currentIndex, this.LOOKBACK_PERIOD);
    const avgVolume = this.average(recentCandles.map(c => c.volume));
    const volumeSpike = currentCandle.volume / avgVolume;

    // Get OI data
    const currentOI = marketData.openInterest.find(
      oi => Math.abs(oi.timestamp - currentTime) < 60 * 60 * 1000 // Within 1 hour
    );
    
    const previousOI = marketData.openInterest.find(
      oi => Math.abs(oi.timestamp - previousCandle.timestamp) < 60 * 60 * 1000
    );

    if (!currentOI || !previousOI || previousOI.value === 0) {
      return signals;
    }

    const oiChange = (currentOI.value - previousOI.value) / previousOI.value;
    const priceChange = this.calculatePriceChange(currentCandle.close, previousCandle.close);

    // Check if we have an open position
    const openPosition = openPositions.find(pos => pos.coin === coin);

    if (openPosition) {
      // Check for exit signals
      if (this.shouldExit(openPosition, oiChange, priceChange)) {
        signals.push({
          timestamp: currentTime,
          coin,
          type: 'exit',
          direction: openPosition.side,
          confidence: 0.75,
          reason: 'OI contraction or trend reversal',
          metadata: {
            oiChange,
            priceChange,
            volumeSpike
          }
        });
      }
    } else {
      // Check for entry signals
      const hasOIExpansion = oiChange > this.OI_EXPANSION_THRESHOLD;
      const hasVolumeSpike = volumeSpike > this.VOLUME_SPIKE_THRESHOLD;

      if (hasOIExpansion && hasVolumeSpike) {
        // Determine direction based on price momentum
        const direction = priceChange > 0 ? 'long' : 'short';
        
        // Higher confidence with stronger signals
        const confidence = Math.min(
          0.6 + (oiChange * 2) + (volumeSpike / 10),
          0.95
        );

        signals.push({
          timestamp: currentTime,
          coin,
          type: 'entry',
          direction,
          confidence,
          reason: `OI expansion ${(oiChange * 100).toFixed(1)}% + Volume spike ${volumeSpike.toFixed(1)}x`,
          metadata: {
            oiChange,
            priceChange,
            volumeSpike,
            avgVolume
          }
        });
      }
    }

    return signals;
  }

  /**
   * Check if position should be exited
   */
  private shouldExit(
    position: Position,
    oiChange: number,
    priceChange: number
  ): boolean {
    // Exit on OI contraction
    if (oiChange < this.OI_CONTRACTION_THRESHOLD) {
      return true;
    }

    // Exit if price moves against position
    const isPriceMoveAgainst = (
      (position.side === 'long' && priceChange < -2) ||
      (position.side === 'short' && priceChange > 2)
    );

    return isPriceMoveAgainst;
  }
}
