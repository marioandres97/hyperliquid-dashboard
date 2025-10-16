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

// ⭐ NUEVA CONFIGURACIÓN - WIN RATE 80%+
export const ELITE_ORDER_FLOW_CONFIG = {
  // Todas las confirmaciones obligatorias
  minConfirmations: 8,
  minConfidence: 0.95,
  
  // Targets y stops optimizados para fees reales (0.0288%)
  targets: {
    BTC: 0.25,
    ETH: 0.25,
    HYPE: 0.35
  },
  
  stops: {
    BTC: 0.12,
    ETH: 0.12,
    HYPE: 0.15
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
  
  // Filtros negativos
  negativeFilters: {
    maxSpread: 0.0002,
    minOrderBookDepth: 1_000_000,
    maxSignalsPerHour: 3,
    minVolumeRatio: 0.5,
    minAvgTradeSize: 10_000,
    oppositeSignalCooldown: 20,
  }
};

// Función para calcular TP/SL dinámicamente
export function calculateTPSL(coin: string, entry: number, type: 'LONG' | 'SHORT') {
  const config = ELITE_ORDER_FLOW_CONFIG;
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