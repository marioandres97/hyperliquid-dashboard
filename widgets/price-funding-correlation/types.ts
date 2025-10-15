export interface FundingDataPoint {
  timestamp: number;
  price: number;
  fundingRate: number;
}

export type Coin = 'BTC' | 'ETH' | 'HYPE';
export type Timeframe = '1h' | '4h' | '1d' | '7d';

export interface WidgetState {
  selectedCoin: Coin;
  selectedTimeframe: Timeframe;
  data: FundingDataPoint[];
  correlation: number | null;
  loading: boolean;
  error: string | null;
}