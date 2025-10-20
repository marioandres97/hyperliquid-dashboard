export type CoinFilter = 'BTC' | 'ETH' | 'HYPE' | 'ALL';
export type SideFilter = 'BUY' | 'SELL' | 'BOTH';

export interface LargeOrder {
  id: string;
  timestamp: number;
  coin: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  usdValue: number;
  exchange: string;
  isWhale?: boolean;
  marketPrice?: number;
  priceImpact?: number;
}

export interface LargeOrderFilters {
  coin?: CoinFilter;
  minSize?: number;
  maxSize?: number;
  side?: SideFilter;
}

export interface AssetStats {
  marketCap?: string;
  dominance?: string;
  openInterest?: string;
  volume24h?: string;
  tvl?: string;
  gasPrice?: string;
  circulatingSupply?: string;
  price?: number;
  priceChange24h?: number;
}

export interface ConnectionState {
  connected: boolean;
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  lastUpdate: number;
  reconnectAttempts?: number;
}

export interface BuySellPressure {
  buyVolume: number;
  sellVolume: number;
  ratio: number;
  trend: 'bullish' | 'bearish' | 'neutral';
}

export interface WhaleAlert {
  order: LargeOrder;
  timestamp: number;
  notified: boolean;
}

export const SIZE_PRESETS = {
  ALL: { min: 10000, max: 10000000 },
  LARGE: { min: 100000, max: 10000000 },
  VERY_LARGE: { min: 500000, max: 10000000 },
  MEGA: { min: 1000000, max: 10000000 },
  WHALES_ONLY: { min: 1000000, max: 10000000 },
} as const;

export const WHALE_THRESHOLD = 1000000; // $1M
