/**
 * Whale Trade Types
 * TypeScript interfaces for whale trade tracking system
 */

export type TradeSide = 'BUY' | 'SELL';

export type WhaleCategory = 'MEGA_WHALE' | 'WHALE' | 'INSTITUTION' | 'LARGE';

export type Timeframe = '1h' | '24h' | '7d' | '30d' | 'all';

export interface WhaleTrade {
  id: string;
  coin: string;
  side: TradeSide;
  price: number;
  size: number;
  usdValue: number;
  timestamp: number;
  tradeId: number;
  isWhale: boolean;
  category: WhaleCategory;
  createdAt: Date;
}

export interface WhaleTradeFilters {
  coin?: string;
  timeframe?: Timeframe;
  category?: WhaleCategory;
  minSize?: number;
  limit?: number;
  offset?: number;
}

export interface WhaleTradeStats {
  totalVolume: number;
  tradeCount: number;
  byCategory: {
    [key in WhaleCategory]: {
      count: number;
      volume: number;
    };
  };
  byCoin: {
    [coin: string]: {
      count: number;
      volume: number;
      buyCount: number;
      sellCount: number;
    };
  };
  buySellRatio: {
    BUY: number;
    SELL: number;
  };
  averageTradeSize: number;
  largestTrade: {
    coin: string;
    usdValue: number;
    timestamp: number;
  } | null;
}

export interface WhaleThresholds {
  [coin: string]: number;
}

export const DEFAULT_WHALE_THRESHOLDS: WhaleThresholds = {
  BTC: 100000,
  ETH: 50000,
  SOL: 25000,
  HYPE: 10000,
  DOGE: 10000,
  AVAX: 10000,
  DEFAULT: 10000,
};

export const CATEGORY_THRESHOLDS = {
  MEGA_WHALE: 1000000,
  WHALE: 100000,
  INSTITUTION: 50000,
  LARGE: 10000,
} as const;