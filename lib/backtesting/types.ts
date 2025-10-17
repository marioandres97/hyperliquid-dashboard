import { PnLEntry } from '@/types/pnl';

export interface BacktestConfig {
  startDate: Date;
  endDate: Date;
  coins: string[];
  initialBalance: number;
  positionSize: number;
}

export interface BacktestResult {
  totalPnL: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: PnLEntry[];
}
