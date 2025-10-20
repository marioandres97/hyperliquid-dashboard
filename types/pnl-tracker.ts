export interface Trade {
  id: string;
  userId?: string;
  asset: string;
  baseAsset: 'USDT' | 'USDC' | 'USD' | 'BTC' | 'ETH';
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number | null;
  size: number;
  fees: number;
  openedAt: Date | string;
  closedAt: Date | string | null;
  pnl: number | null;
  pnlPercent: number | null;
  notes: string | null;
  status: 'open' | 'closed';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateTradeInput {
  asset: string;
  baseAsset: 'USDT' | 'USDC' | 'USD' | 'BTC' | 'ETH';
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number | null;
  size: number;
  fees?: number;
  openedAt: string;
  closedAt?: string | null;
  notes?: string;
}

export interface UpdateTradeInput {
  asset?: string;
  baseAsset?: 'USDT' | 'USDC' | 'USD' | 'BTC' | 'ETH';
  type?: 'long' | 'short';
  entryPrice?: number;
  exitPrice?: number | null;
  size?: number;
  fees?: number;
  openedAt?: string;
  closedAt?: string | null;
  notes?: string;
}

export interface TradeFilters {
  asset?: string;
  status?: 'open' | 'closed' | 'all';
  baseAsset?: string;
}

export interface PnLMetrics {
  totalPnL: number;
  totalPnLPercent: number;
  openPositions: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeSize: number;
  totalFeesPaid: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}
