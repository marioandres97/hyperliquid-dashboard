export interface LargeTrade {
  id: string;
  timestamp: Date;
  volume: number;
  priceBefore: number;
  priceAfter: number;
  priceImpact: number;
  direction: 'BUY' | 'SELL';
  walletLabel?: string;
  cascadeDepth?: number;
  cascadeVolume?: number;
}

export interface TradeFilter {
  minSize: number;
  direction: 'BUY' | 'SELL' | 'BOTH';
  minPriceImpact: number;
  timeRange: '5m' | '15m' | '1h' | '4h' | '24h';
}
