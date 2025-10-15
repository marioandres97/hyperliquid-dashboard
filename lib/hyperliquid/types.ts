// Tipos para los datos de Hyperliquid

export interface AssetContext {
  coin: string;
  markPx: string;
  openInterest: string;
  funding: string;
  dayNtlVlm: string;
  prevDayPx: string;
  midPx?: string;
}

export interface CandleData {
  t: number; // open time
  T: number; // close time
  s: string; // coin
  i: string; // interval
  o: string; // open
  c: string; // close
  h: string; // high
  l: string; // low
  v: string; // volume
  n: number; // number of trades
}

export interface OIPriceData {
  timestamp: number;
  price: number;
  openInterest: number;
}

export type Coin = 'BTC' | 'ETH' | 'HYPE';
export type Timeframe = '1h' | '4h' | '1d' | '7d' | '30d';