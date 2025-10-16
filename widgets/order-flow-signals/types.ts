export interface Trade {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
  isLarge?: boolean;
  isLiquidation?: boolean;
}

export interface CVDData {
  value: number;
  timestamp: number;
  buyVolume: number;
  sellVolume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBookSnapshot {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

export interface SignalConfirmation {
  type: 'cvd_divergence' | 'aggressive_imbalance' | 'large_order' | 'hvn_lvn' | 'wall_broken' | 'no_liquidations';
  met: boolean;
  value?: string | number;
  description: string;
}

export interface Signal {
  id: string;
  type: 'LONG' | 'SHORT';
  coin: string;
  price: number;
  confidence: number;
  confirmations: SignalConfirmation[];
  entry: number;
  target: number;
  stop: number;
  timestamp: number;
  reasoning: string;
}

export interface SignalConfig {
  minConfirmations: number;
  minConfidence: number;
  largeOrderThreshold: number;
  aggressiveImbalanceThreshold: number;
  cooldownMs: number;
}

export interface SignalWithMetadata extends Signal {
  isNew: boolean;
  isDismissed: boolean;
}