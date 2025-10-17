export type Coin = 'BTC' | 'ETH' | 'HYPE';

export interface PriceData {
  coin: Coin;
  price: number;
  change24h: number;
  lastUpdate: Date;
}

export interface AllPricesMessage {
  channel: 'allMids';
  data: {
    mids: Record<string, string>;
  };
}
