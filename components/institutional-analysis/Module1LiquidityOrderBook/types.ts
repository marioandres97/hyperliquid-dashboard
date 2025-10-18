export interface OrderBookLevel {
  price: number;
  volume: number;
  accumulated: number;
  distanceFromPrice: number;
  isNew?: boolean;
  isRemoved?: boolean;
  icebergSuspicion?: number; // 0-100 confidence
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  currentPrice: number;
  lastUpdate: Date;
}

export interface VolumeImbalance {
  buyVolume: number;
  sellVolume: number;
  ratio: number;
  timestamp: Date;
}

export interface LiquidityAlert {
  id: string;
  type: 'sudden_appearance' | 'sudden_disappearance' | 'iceberg_detected';
  price: number;
  volume: number;
  side: 'bid' | 'ask';
  timestamp: Date;
}
