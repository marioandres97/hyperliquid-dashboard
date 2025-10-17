import { BaseStrategy } from './baseStrategy';
import { Signal, MarketData, Position } from '../types';

/**
 * Liquidation Clusters Strategy
 * 
 * Logic:
 * - Entry: Mass liquidation detected (>$5M in 1 hour)
 * - Direction: Counter-trend (buy after long liquidations, short after short liquidations)
 * - Exit: Price recovers or TP/SL
 * - Timeframe: 15m-1h candles
 * - Expected hold time: 1-8 hours
 */
export class LiquidationClustersStrategy extends BaseStrategy {
  private readonly LIQUIDATION_THRESHOLD = 5_000_000; // $5M
  private readonly LOOKBACK_HOURS = 1; // Check liquidations in last hour
  private readonly RECOVERY_PERCENT = 2; // 2% price recovery

  constructor() {
    super(
      'Liquidation Clusters',
      'Counter-trend strategy capitalizing on mass liquidation events'
    );
  }

  generateSignals(
    marketData: MarketData,
    currentIndex: number,
    openPositions: Position[]
  ): Signal[] {
    const signals: Signal[] = [];
    
    if (currentIndex < 4 || currentIndex >= marketData.candles.length) {
      return signals;
    }

    const currentCandle = marketData.candles[currentIndex];
    const currentTime = currentCandle.timestamp;
    const coin = 'BTC'; // Simplified

    // Calculate lookback window
    const lookbackTime = currentTime - (this.LOOKBACK_HOURS * 60 * 60 * 1000);

    // Get recent liquidations
    const recentLiquidations = marketData.liquidations.filter(
      liq => liq.timestamp > lookbackTime && liq.timestamp <= currentTime
    );

    if (recentLiquidations.length === 0) {
      return signals;
    }

    // Aggregate liquidations by side
    const longLiquidations = recentLiquidations
      .filter(liq => liq.side === 'long')
      .reduce((sum, liq) => sum + liq.amount, 0);

    const shortLiquidations = recentLiquidations
      .filter(liq => liq.side === 'short')
      .reduce((sum, liq) => sum + liq.amount, 0);

    // Check if we have an open position
    const openPosition = openPositions.find(pos => pos.coin === coin);

    if (openPosition) {
      // Check for exit signals based on price recovery
      const entryCandle = marketData.candles.find(
        c => Math.abs(c.timestamp - openPosition.entryTime) < 60 * 60 * 1000
      );

      if (entryCandle) {
        const priceChange = this.calculatePriceChange(
          currentCandle.close,
          entryCandle.close
        );

        const hasRecovered = (
          (openPosition.side === 'long' && priceChange > this.RECOVERY_PERCENT) ||
          (openPosition.side === 'short' && priceChange < -this.RECOVERY_PERCENT)
        );

        if (hasRecovered) {
          signals.push({
            timestamp: currentTime,
            coin,
            type: 'exit',
            direction: openPosition.side,
            confidence: 0.8,
            reason: 'Price recovered from liquidation event',
            metadata: {
              priceChange,
              entryPrice: openPosition.entryPrice,
              currentPrice: currentCandle.close
            }
          });
        }
      }
    } else {
      // Check for entry signals
      
      // Mass long liquidations -> BUY (price likely bottomed)
      if (longLiquidations > this.LIQUIDATION_THRESHOLD) {
        const confidence = Math.min(
          0.65 + (longLiquidations / this.LIQUIDATION_THRESHOLD) * 0.15,
          0.95
        );

        signals.push({
          timestamp: currentTime,
          coin,
          type: 'entry',
          direction: 'long',
          confidence,
          reason: `Mass long liquidations: $${(longLiquidations / 1_000_000).toFixed(1)}M`,
          metadata: {
            longLiquidations,
            shortLiquidations,
            totalLiquidations: longLiquidations + shortLiquidations,
            liquidationCount: recentLiquidations.filter(l => l.side === 'long').length
          }
        });
      }
      
      // Mass short liquidations -> SHORT (price likely topped)
      else if (shortLiquidations > this.LIQUIDATION_THRESHOLD) {
        const confidence = Math.min(
          0.65 + (shortLiquidations / this.LIQUIDATION_THRESHOLD) * 0.15,
          0.95
        );

        signals.push({
          timestamp: currentTime,
          coin,
          type: 'entry',
          direction: 'short',
          confidence,
          reason: `Mass short liquidations: $${(shortLiquidations / 1_000_000).toFixed(1)}M`,
          metadata: {
            longLiquidations,
            shortLiquidations,
            totalLiquidations: longLiquidations + shortLiquidations,
            liquidationCount: recentLiquidations.filter(l => l.side === 'short').length
          }
        });
      }
    }

    return signals;
  }
}
