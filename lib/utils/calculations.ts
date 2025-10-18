/**
 * Calculate price impact for a given order size
 * @param orderSize - Size of the order
 * @param orderBookLevels - Array of price levels from order book
 * @param currentPrice - Current mid price
 * @returns Price impact percentage
 */
export function calculatePriceImpact(
  orderSize: number,
  orderBookLevels: Array<{ price: number; volume: number }>,
  currentPrice: number
): number {
  let remainingSize = orderSize;
  let totalCost = 0;

  for (const level of orderBookLevels) {
    if (remainingSize <= 0) break;

    const sizeAtThisLevel = Math.min(remainingSize, level.volume);
    totalCost += sizeAtThisLevel * level.price;
    remainingSize -= sizeAtThisLevel;
  }

  if (remainingSize > 0) {
    // Not enough liquidity
    return Infinity;
  }

  const avgExecutionPrice = totalCost / orderSize;
  const priceImpact = ((avgExecutionPrice - currentPrice) / currentPrice) * 100;

  return Math.abs(priceImpact);
}

/**
 * Calculate average entry price from multiple trades
 */
export function calculateAverageEntry(
  trades: Array<{ price: number; size: number }>
): number {
  if (trades.length === 0) return 0;

  const totalNotional = trades.reduce((sum, trade) => sum + trade.price * trade.size, 0);
  const totalSize = trades.reduce((sum, trade) => sum + trade.size, 0);

  return totalSize > 0 ? totalNotional / totalSize : 0;
}

/**
 * Calculate unrealized PnL
 */
export function calculateUnrealizedPnL(
  entryPrice: number,
  currentPrice: number,
  size: number,
  side: 'LONG' | 'SHORT'
): number {
  if (side === 'LONG') {
    return (currentPrice - entryPrice) * size;
  } else {
    return (entryPrice - currentPrice) * size;
  }
}

/**
 * Calculate PnL percentage
 */
export function calculatePnLPercent(
  entryPrice: number,
  currentPrice: number,
  side: 'LONG' | 'SHORT'
): number {
  if (entryPrice === 0) return 0;

  if (side === 'LONG') {
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - currentPrice) / entryPrice) * 100;
  }
}

/**
 * Calculate liquidation price
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: 'LONG' | 'SHORT',
  maintenanceMarginRate: number = 0.005 // 0.5% default
): number {
  if (side === 'LONG') {
    return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
  }
}

/**
 * Calculate required margin for position
 */
export function calculateRequiredMargin(
  notionalValue: number,
  leverage: number
): number {
  return notionalValue / leverage;
}

/**
 * Calculate funding rate impact over time
 */
export function calculateFundingImpact(
  positionSize: number,
  fundingRate: number,
  hours: number
): number {
  // Funding is typically charged every 8 hours
  const fundingPeriods = hours / 8;
  return positionSize * fundingRate * fundingPeriods;
}

/**
 * Calculate order book imbalance
 */
export function calculateOrderBookImbalance(
  bidVolume: number,
  askVolume: number
): number {
  const totalVolume = bidVolume + askVolume;
  if (totalVolume === 0) return 0;

  return ((bidVolume - askVolume) / totalVolume) * 100;
}

/**
 * Calculate volume-weighted average price (VWAP)
 */
export function calculateVWAP(
  trades: Array<{ price: number; size: number }>
): number {
  if (trades.length === 0) return 0;

  const totalNotional = trades.reduce((sum, trade) => sum + trade.price * trade.size, 0);
  const totalVolume = trades.reduce((sum, trade) => sum + trade.size, 0);

  return totalVolume > 0 ? totalNotional / totalVolume : 0;
}

/**
 * Calculate Sharpe ratio for a series of returns
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0
): number {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = equityCurve[0];

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = ((peak - value) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Calculate position size based on risk management
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number
): number {
  const riskAmount = accountBalance * (riskPercent / 100);
  const priceRisk = Math.abs(entryPrice - stopLossPrice);

  if (priceRisk === 0) return 0;

  return riskAmount / priceRisk;
}

/**
 * Calculate break-even price including fees
 */
export function calculateBreakEvenPrice(
  entryPrice: number,
  side: 'LONG' | 'SHORT',
  takerFeeRate: number = 0.0005 // 0.05% default
): number {
  const totalFeeRate = takerFeeRate * 2; // Entry + Exit

  if (side === 'LONG') {
    return entryPrice * (1 + totalFeeRate);
  } else {
    return entryPrice * (1 - totalFeeRate);
  }
}
