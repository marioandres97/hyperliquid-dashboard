export interface PnLEntry {
  id: string;
  signalId: string;
  coin: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  exitReason: 'target' | 'stop' | 'trailing_stop' | 'break_even' | 'partial_tp';
  pnlPercent: number;
  pnlUsd: number;  // Based on position size
  timestamp: number;
  duration: number;  // Milliseconds
  partialClose?: {
    percent: number;
    price: number;
  };
}

export interface PnLStats {
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  byTimeframe: {
    today: number;
    week: number;
    month: number;
  };
  bySignalType: {
    LONG: {
      totalTrades: number;
      winningTrades: number;
      losingTrades: number;
      winRate: number;
      totalPnL: number;
    };
    SHORT: {
      totalTrades: number;
      winningTrades: number;
      losingTrades: number;
      winRate: number;
      totalPnL: number;
    };
  };
  equityCurve: Array<{
    timestamp: number;
    equity: number;
    pnl: number;
  }>;
}
