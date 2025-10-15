export interface Trade {
  coin: string;
  side: 'B' | 'A'; // B = Buy, A = Ask/Sell
  px: string;
  sz: string;
  time: number;
  hash: string;
  tid: number;
}

export interface OrderFlowMetrics {
  cvd: number; // Cumulative Volume Delta
  buyVolume: number;
  sellVolume: number;
  buyRatio: number; // 0-100
  totalVolume: number;
  tradeCount: number;
  avgTradeSize: number;
  largeTradeCount: number; // trades > $10k
}

export interface TimeframeDelta {
  timestamp: number;
  delta: number;
  buyVol: number;
  sellVol: number;
}

export type Timeframe = '5m' | '15m' | '1h' | '4h';
export type Coin = 'BTC' | 'ETH' | 'HYPE';