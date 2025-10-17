import { CostConfig, Position, Trade, PositionSide } from '../types';

export class CostCalculator {
  constructor(private config: CostConfig) {}

  /**
   * Calculate trading fees for a position
   * Uses conservative approach with fee multiplier
   */
  calculateFees(size: number, leverage: number, isMaker: boolean = false): number {
    const baseFee = isMaker ? this.config.makerFee : this.config.takerFee;
    const leveragedSize = size * leverage;
    
    // Entry + Exit fees
    const totalFees = leveragedSize * baseFee * 2;
    
    // Apply conservative multiplier
    return totalFees * this.config.feeMultiplier;
  }

  /**
   * Calculate slippage based on volatility
   * Higher volatility = higher slippage
   */
  calculateSlippage(
    price: number,
    size: number,
    side: 'buy' | 'sell',
    volatility: number = 0 // 0-1 scale
  ): { adjustedPrice: number; slippageCost: number } {
    const baseSlippage = this.config.slippageBase;
    const volatilitySlippage = volatility * this.config.slippageVolatility;
    const totalSlippage = baseSlippage + volatilitySlippage;
    
    // Slippage is always negative for the trader
    const slippageMultiplier = side === 'buy' ? (1 + totalSlippage) : (1 - totalSlippage);
    const adjustedPrice = price * slippageMultiplier;
    const slippageCost = Math.abs(adjustedPrice - price) * (size / price);
    
    return { adjustedPrice, slippageCost };
  }

  /**
   * Calculate funding rate costs
   * Conservative: always assumes worst case (paying funding)
   */
  calculateFunding(
    position: Position,
    fundingRates: number[], // hourly rates during position lifetime
    hoursHeld: number
  ): number {
    if (fundingRates.length === 0) {
      // No data: use conservative estimate (0.01% per hour = ~0.24% per day)
      return position.size * position.leverage * 0.0001 * hoursHeld;
    }

    let totalFunding = 0;
    
    if (this.config.fundingAssumption === 'negative') {
      // Always assume paying funding (worst case)
      // Use 75th percentile of absolute rates
      const sortedRates = fundingRates.map(Math.abs).sort((a, b) => a - b);
      const percentile75Index = Math.floor(sortedRates.length * 0.75);
      const conservativeRate = sortedRates[percentile75Index] || 0.0001;
      
      totalFunding = position.size * position.leverage * conservativeRate * hoursHeld;
    } else if (this.config.fundingAssumption === 'neutral') {
      // Use actual rates but assume worst case direction
      totalFunding = fundingRates.reduce((sum, rate) => {
        const costPerHour = position.size * position.leverage * Math.abs(rate);
        return sum + costPerHour;
      }, 0);
    } else {
      // Positive assumption: still conservative, use median
      const sortedRates = fundingRates.map(Math.abs).sort((a, b) => a - b);
      const medianIndex = Math.floor(sortedRates.length / 2);
      const medianRate = sortedRates[medianIndex] || 0.00005;
      
      totalFunding = position.size * position.leverage * medianRate * hoursHeld;
    }
    
    return totalFunding;
  }

  /**
   * Calculate total costs for a trade
   */
  calculateTotalCosts(trade: Trade): number {
    return trade.fees + trade.slippage + trade.funding;
  }

  /**
   * Calculate volatility from recent price data
   * Returns value between 0-1
   */
  calculateVolatility(prices: number[], period: number = 20): number {
    if (prices.length < period) {
      return 0.5; // Default moderate volatility
    }

    const recentPrices = prices.slice(-period);
    const returns = [];
    
    for (let i = 1; i < recentPrices.length; i++) {
      const ret = (recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1];
      returns.push(ret);
    }

    // Calculate standard deviation
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-1 scale (assume 5% daily std dev is max)
    const normalized = Math.min(stdDev / 0.05, 1);
    
    return normalized;
  }

  /**
   * Apply stress test multiplier to costs
   */
  applyStressMultiplier(multiplier: number): CostConfig {
    return {
      ...this.config,
      feeMultiplier: this.config.feeMultiplier * multiplier,
      slippageBase: this.config.slippageBase * multiplier,
      slippageVolatility: this.config.slippageVolatility * multiplier
    };
  }
}
