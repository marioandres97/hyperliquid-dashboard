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
  type: 'cvd_divergence' | 'aggressive_imbalance' | 'large_order' | 
        'hvn_lvn' | 'wall_broken' | 'no_liquidations' | 
        'orderbook_imbalance'; // ⭐ NUEVO
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
}

export interface SignalWithMetadata extends Signal {
  isNew: boolean;
  isDismissed: boolean;
}

export interface TrackedSignal extends Signal {
  status: 'active' | 'hit_target' | 'hit_stop' | 'expired' | 'dismissed';
  exitPrice?: number;
  exitTimestamp?: number;
  pnl?: number;
  duration?: number;
  movedToBreakEven?: boolean;
  trailingStopPrice?: number;
  partialsClosed?: Record<number, boolean>;
}

export interface SignalStats {
  totalSignals: number;
  winRate: number;
  avgPnL: number;
  byStatus: {
    hit_target: number;
    hit_stop: number;
    expired: number;
    dismissed: number;
  };
  byCoin: {
    [coin: string]: {
      total: number;
      wins: number;
      winRate: number;
    };
  };
}

// ⭐ SCALPING CONFIGURATION - Optimized for quick trades
export const SCALPING_CONFIG = {
  // All confirmations required
  minConfirmations: 8,
  minConfidence: 0.95,
  
  // Targets adjusted for SCALPING (tighter than swing)
  targets: {
    BTC: 0.08,   // 0.08% (~$85 on BTC at $106k)
    ETH: 0.10,   // 0.10% (~$3.70 on ETH at $3700)
    HYPE: 0.12   // 0.12% (~$0.04 on HYPE at $35)
  },
  
  stops: {
    BTC: 0.04,   // 0.04% stop
    ETH: 0.05,   // 0.05% stop
    HYPE: 0.06   // 0.06% stop
  },
  
  // NEW: Break-even automatic
  breakEven: {
    BTC: 0.03,   // Move stop to BE after +0.03%
    ETH: 0.04,
    HYPE: 0.05
  },
  
  // NEW: Trailing stop
  trailingStop: {
    enabled: true,
    distance: {
      BTC: 0.02,  // 0.02% trailing
      ETH: 0.03,
      HYPE: 0.04
    }
  },
  
  // NEW: Partial take profits
  partialTakeProfit: {
    enabled: true,
    levels: [
      { percent: 50, atProfit: 0.05 },  // 50% at +0.05%
      { percent: 30, atProfit: 0.07 },  // 30% at +0.07%
      { percent: 20, atProfit: 0.08 }   // 20% at target
    ]
  },
  
  // Thresholds ultra-agresivos
  thresholds: {
    // CVD Divergence
    cvdMinCandles: 20,
    cvdMinTouches: 4,
    cvdMustCrossZero: true,
    
    // Aggressive Imbalance
    aggressiveImbalance: 0.90,
    imbalanceSustainedCandles: 5,
    
    // Large Orders
    largeOrderSizes: {
      BTC: 1_000_000,
      ETH: 800_000,
      HYPE: 300_000
    },
    largeOrderClusterMin: 3,
    largeOrderWindow: 15,
    
    // No Liquidations
    liquidationLookback: 50,
    largeLiquidationSize: 500_000,
    largeLiquidationWait: 100,
    
    // Volume Profile - POC
    pocMaxDistance: 1,
    pocMinHVNRatio: 3,
    
    // VA Boundary
    vaBoundaryPrecision: 0.0005,
    vaBoundaryConfirmCandles: 3,
    
    // HVN/LVN
    hvnMinRatio: 3.0,
    lvnMaxRatio: 0.3,
    hvnLvnConfirmCandles: 3,

    // ⭐ NUEVO: Order Book Imbalance
    orderbookImbalanceRatio: 2.0, // 2:1 ratio mínimo
    
  },
  
  // Keep existing optimized filters
  negativeFilters: {
    maxSpread: 0.0002,
    minOrderBookDepth: 1_000_000,
    maxSignalsPerHour: 5,  // Increased from 3 for scalping
    minVolumeRatio: 0.6,   // Slightly more permissive
    minAvgTradeSize: 5000, // Lower for scalping
    oppositeSignalCooldown: 3,  // Reduced from 20 for scalping
  }
};

// Keep old config for backward compatibility
export const ELITE_ORDER_FLOW_CONFIG = SCALPING_CONFIG;

// Function to calculate TP/SL dynamically
export function calculateTPSL(coin: string, entry: number, type: 'LONG' | 'SHORT') {
  const config = SCALPING_CONFIG;
  const targetPct = config.targets[coin as keyof typeof config.targets] || config.targets.BTC;
  const stopPct = config.stops[coin as keyof typeof config.stops] || config.stops.BTC;
  
  if (type === 'LONG') {
    return {
      target: entry * (1 + targetPct / 100),
      stop: entry * (1 - stopPct / 100)
    };
  } else {
    return {
      target: entry * (1 - targetPct / 100),
      stop: entry * (1 + stopPct / 100)
    };
  }
}