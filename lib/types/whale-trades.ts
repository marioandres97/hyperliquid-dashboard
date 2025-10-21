export type WhaleTrade = {
  id: string;
  coin: string;
  size: number;
  timestamp: Date;
};

export type WhaleTradeStats = {
  totalTrades: number;
  totalVolume: number;
  averageSize: number;
};

export type WhaleTradeFilters = {
  coin?: string;
  minSize?: number;
  category?: string;
};

export type WhaleCategory = 'MEGA_WHALE' | 'WHALE' | 'INSTITUTION' | 'LARGE';