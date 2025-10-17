import { Candle, FundingRate, OpenInterest, Liquidation, MarketData } from '../types';

export class DataValidator {
  /**
   * Validate and clean candle data
   */
  validateCandles(candles: Candle[]): { 
    valid: Candle[]; 
    errors: string[]; 
    warnings: string[];
  } {
    const valid: Candle[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < candles.length; i++) {
      const candle = candles[i];
      
      // Check for required fields
      if (!candle.timestamp || !candle.open || !candle.high || !candle.low || !candle.close) {
        errors.push(`Candle ${i}: Missing required fields`);
        continue;
      }

      // Check for valid price relationships
      if (candle.high < candle.low) {
        errors.push(`Candle ${i}: High < Low`);
        continue;
      }

      if (candle.high < candle.open || candle.high < candle.close) {
        warnings.push(`Candle ${i}: High is not the highest price`);
      }

      if (candle.low > candle.open || candle.low > candle.close) {
        warnings.push(`Candle ${i}: Low is not the lowest price`);
      }

      // Check for negative values
      if (candle.open < 0 || candle.high < 0 || candle.low < 0 || candle.close < 0 || candle.volume < 0) {
        errors.push(`Candle ${i}: Negative values detected`);
        continue;
      }

      // Check for extreme price movements (>50% in one candle)
      const priceRange = (candle.high - candle.low) / candle.low;
      if (priceRange > 0.5) {
        warnings.push(`Candle ${i}: Extreme price movement ${(priceRange * 100).toFixed(1)}%`);
      }

      valid.push(candle);
    }

    return { valid, errors, warnings };
  }

  /**
   * Fill gaps in candle data
   */
  fillCandleGaps(candles: Candle[], intervalMs: number): Candle[] {
    if (candles.length < 2) return candles;

    const filled: Candle[] = [];
    
    for (let i = 0; i < candles.length - 1; i++) {
      filled.push(candles[i]);
      
      const currentTime = candles[i].timestamp;
      const nextTime = candles[i + 1].timestamp;
      const gap = nextTime - currentTime;
      
      // If there's a gap larger than the interval, fill it
      if (gap > intervalMs * 1.5) {
        const missingCandles = Math.floor(gap / intervalMs) - 1;
        
        for (let j = 1; j <= missingCandles; j++) {
          const interpolatedCandle: Candle = {
            timestamp: currentTime + (j * intervalMs),
            open: candles[i].close,
            high: candles[i].close,
            low: candles[i].close,
            close: candles[i].close,
            volume: 0
          };
          filled.push(interpolatedCandle);
        }
      }
    }
    
    filled.push(candles[candles.length - 1]);
    
    return filled;
  }

  /**
   * Validate funding rates
   */
  validateFundingRates(rates: FundingRate[]): {
    valid: FundingRate[];
    errors: string[];
    warnings: string[];
  } {
    const valid: FundingRate[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      
      if (!rate.timestamp || rate.rate === undefined) {
        errors.push(`Funding rate ${i}: Missing required fields`);
        continue;
      }

      // Check for extreme funding rates (>0.5% hourly = 182.5% APR)
      if (Math.abs(rate.rate) > 0.005) {
        warnings.push(`Funding rate ${i}: Extreme rate ${(rate.rate * 100).toFixed(4)}%`);
      }

      valid.push(rate);
    }

    return { valid, errors, warnings };
  }

  /**
   * Validate open interest data
   */
  validateOpenInterest(oi: OpenInterest[]): {
    valid: OpenInterest[];
    errors: string[];
    warnings: string[];
  } {
    const valid: OpenInterest[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < oi.length; i++) {
      const oiPoint = oi[i];
      
      if (!oiPoint.timestamp || oiPoint.value === undefined) {
        errors.push(`OI ${i}: Missing required fields`);
        continue;
      }

      if (oiPoint.value < 0) {
        errors.push(`OI ${i}: Negative value`);
        continue;
      }

      // Check for extreme OI changes (>50% in short period)
      if (i > 0) {
        const prevOI = oi[i - 1];
        const change = Math.abs((oiPoint.value - prevOI.value) / prevOI.value);
        
        if (change > 0.5) {
          warnings.push(`OI ${i}: Extreme change ${(change * 100).toFixed(1)}%`);
        }
      }

      valid.push(oiPoint);
    }

    return { valid, errors, warnings };
  }

  /**
   * Validate liquidation data
   */
  validateLiquidations(liquidations: Liquidation[]): {
    valid: Liquidation[];
    errors: string[];
    warnings: string[];
  } {
    const valid: Liquidation[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < liquidations.length; i++) {
      const liq = liquidations[i];
      
      if (!liq.timestamp || !liq.side || liq.amount === undefined || liq.price === undefined) {
        errors.push(`Liquidation ${i}: Missing required fields`);
        continue;
      }

      if (liq.amount < 0 || liq.price < 0) {
        errors.push(`Liquidation ${i}: Negative values`);
        continue;
      }

      if (liq.side !== 'long' && liq.side !== 'short') {
        errors.push(`Liquidation ${i}: Invalid side`);
        continue;
      }

      valid.push(liq);
    }

    return { valid, errors, warnings };
  }

  /**
   * Validate complete market data
   */
  validateMarketData(data: MarketData): {
    valid: boolean;
    validatedData: MarketData;
    errors: string[];
    warnings: string[];
  } {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate each data type
    const candleValidation = this.validateCandles(data.candles);
    const fundingValidation = this.validateFundingRates(data.fundingRates);
    const oiValidation = this.validateOpenInterest(data.openInterest);
    const liqValidation = this.validateLiquidations(data.liquidations);

    allErrors.push(...candleValidation.errors);
    allErrors.push(...fundingValidation.errors);
    allErrors.push(...oiValidation.errors);
    allErrors.push(...liqValidation.errors);

    allWarnings.push(...candleValidation.warnings);
    allWarnings.push(...fundingValidation.warnings);
    allWarnings.push(...oiValidation.warnings);
    allWarnings.push(...liqValidation.warnings);

    // Check for minimum data requirements
    if (candleValidation.valid.length < 100) {
      allErrors.push(`Insufficient candles: ${candleValidation.valid.length} (minimum 100 required)`);
    }

    const validatedData: MarketData = {
      candles: candleValidation.valid,
      fundingRates: fundingValidation.valid,
      openInterest: oiValidation.valid,
      liquidations: liqValidation.valid
    };

    return {
      valid: allErrors.length === 0,
      validatedData,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Remove outliers from data
   */
  removeOutliers(values: number[], threshold: number = 3): number[] {
    if (values.length === 0) return values;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return values.filter(val => Math.abs(val - mean) <= threshold * stdDev);
  }
}
