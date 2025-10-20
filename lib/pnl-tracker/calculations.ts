import { Trade } from '@/types/pnl-tracker';

/**
 * Calculate PnL for a trade
 */
export function calculatePnL(
  type: 'long' | 'short',
  entryPrice: number,
  exitPrice: number | null,
  size: number,
  fees: number = 0,
  currentPrice?: number
): { pnl: number; pnlPercent: number } | null {
  // For open positions, use current price if provided
  const actualExitPrice = exitPrice ?? currentPrice;
  
  if (!actualExitPrice) {
    return null; // Cannot calculate PnL for open position without current price
  }

  let pnl: number;
  
  if (type === 'long') {
    pnl = (actualExitPrice - entryPrice) * size - fees;
  } else {
    pnl = (entryPrice - actualExitPrice) * size - fees;
  }
  
  const pnlPercent = (pnl / (entryPrice * size)) * 100;
  
  return { pnl, pnlPercent };
}

/**
 * Calculate metrics from an array of trades
 */
export function calculateMetrics(trades: Trade[]) {
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== null);
  const openTrades = trades.filter(t => t.status === 'open');

  if (closedTrades.length === 0) {
    return {
      totalPnL: 0,
      totalPnLPercent: 0,
      openPositions: openTrades.length,
      winRate: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgTradeSize: 0,
      totalFeesPaid: trades.reduce((sum, t) => sum + t.fees, 0),
      totalTrades: trades.length,
      winningTrades: 0,
      losingTrades: 0,
    };
  }

  const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalInvested = closedTrades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0);
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const winners = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losers = closedTrades.filter(t => (t.pnl || 0) <= 0);
  const winRate = closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0;

  const pnlValues = closedTrades.map(t => t.pnl || 0);
  const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
  const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

  const avgTradeSize = closedTrades.length > 0 
    ? closedTrades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0) / closedTrades.length 
    : 0;

  const totalFeesPaid = trades.reduce((sum, t) => sum + t.fees, 0);

  return {
    totalPnL,
    totalPnLPercent,
    openPositions: openTrades.length,
    winRate,
    bestTrade,
    worstTrade,
    avgTradeSize,
    totalFeesPaid,
    totalTrades: trades.length,
    winningTrades: winners.length,
    losingTrades: losers.length,
  };
}

/**
 * Calculate cumulative PnL for chart
 */
export function calculateCumulativePnL(trades: Trade[]) {
  const closedTrades = trades
    .filter(t => t.status === 'closed' && t.closedAt)
    .sort((a, b) => new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime());

  let cumulative = 0;
  return closedTrades.map(trade => {
    cumulative += trade.pnl || 0;
    return {
      date: trade.closedAt!,
      pnl: cumulative,
      tradePnl: trade.pnl || 0,
      asset: trade.asset,
    };
  });
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, includeSign: boolean = false): string {
  const sign = includeSign && value >= 0 ? '+' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, includeSign: boolean = false): string {
  const sign = includeSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
