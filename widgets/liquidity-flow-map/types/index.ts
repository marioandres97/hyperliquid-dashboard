// Core type definitions for Liquidity Flow Map system

export type Coin = 'BTC' | 'ETH' | 'HYPE';
export type FlowDirection = 'inflow' | 'outflow' | 'neutral';
export type LiquidityLevel = 'whale' | 'large' | 'medium' | 'small';
export type TimeWindow = '1m' | '5m' | '15m' | '1h' | '4h';

/**
 * Raw trade data from WebSocket
 */
export interface RawTrade {
  coin: string;
  side: 'B' | 'A'; // B = Buy, A = Ask/Sell
  px: string;      // price
  sz: string;      // size
  time: number;    // timestamp in ms
  hash: string;
  tid: number;     // trade id
}

/**
 * Raw liquidation data
 */
export interface RawLiquidation {
  coin: string;
  side: 'long' | 'short'; // which side got liquidated
  price: string;
  size: string;
  time: number;
  liqId: string;
}

/**
 * Classified trade with additional metadata
 */
export interface ClassifiedTrade {
  coin: Coin;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  notional: number; // price * size in USD
  timestamp: number;
  hash: string;
  tid: number;
  classification: {
    level: LiquidityLevel;
    isAggressive: boolean; // market order vs limit
    isWhale: boolean;
  };
}

/**
 * Classified liquidation with metadata
 */
export interface ClassifiedLiquidation {
  coin: Coin;
  side: 'long' | 'short';
  price: number;
  size: number;
  notional: number;
  timestamp: number;
  liqId: string;
  classification: {
    level: LiquidityLevel;
    cascadeRisk: 'high' | 'medium' | 'low';
  };
}

/**
 * Liquidity node representing aggregated flow at a price level
 */
export interface LiquidityNode {
  price: number;
  buyVolume: number;
  sellVolume: number;
  netFlow: number;          // buyVolume - sellVolume
  buyCount: number;
  sellCount: number;
  dominantSide: 'buy' | 'sell' | 'neutral';
  whaleActivity: boolean;   // any whale trades at this level
  liquidations: number;     // count of liquidations
  timestamp: number;        // last update time
}

/**
 * Flow data for a specific time window
 */
export interface FlowData {
  coin: Coin;
  timeWindow: TimeWindow;
  startTime: number;
  endTime: number;
  nodes: Map<number, LiquidityNode>; // price -> node
  trades: ClassifiedTrade[];
  liquidations: ClassifiedLiquidation[];
  metrics: FlowMetrics;
}

/**
 * Aggregated metrics for flow analysis
 */
export interface FlowMetrics {
  totalBuyVolume: number;
  totalSellVolume: number;
  totalBuyNotional: number;
  totalSellNotional: number;
  netFlow: number;
  flowDirection: FlowDirection;
  
  // Trade metrics
  totalTrades: number;
  buyTradeCount: number;
  sellTradeCount: number;
  avgTradeSize: number;
  
  // Whale metrics
  whaleTradeCount: number;
  whaleBuyVolume: number;
  whaleSellVolume: number;
  whaleNetFlow: number;
  
  // Liquidation metrics
  totalLiquidations: number;
  longLiquidations: number;
  shortLiquidations: number;
  totalLiquidationVolume: number;
  
  // Price levels
  highestBuyLevel: number | null;
  highestSellLevel: number | null;
  mostActivePrice: number | null;
  
  // Imbalance
  volumeImbalance: number; // -1 to 1, negative = sell pressure
  tradeImbalance: number;  // -1 to 1
  whaleImbalance: number;  // -1 to 1
}

/**
 * Time-series point for flow visualization
 */
export interface FlowTimePoint {
  timestamp: number;
  netFlow: number;
  buyVolume: number;
  sellVolume: number;
  whaleFlow: number;
  liquidationVolume: number;
  price: number;
}

/**
 * Flow classification result
 */
export interface FlowClassification {
  direction: FlowDirection;
  strength: number; // 0-100
  confidence: number; // 0-1
  signals: FlowSignal[];
}

/**
 * Individual flow signal
 */
export interface FlowSignal {
  type: 'whale_accumulation' | 'whale_distribution' | 
        'liquidation_cascade' | 'aggressive_buying' | 
        'aggressive_selling' | 'balanced_flow';
  strength: number;
  description: string;
  timestamp: number;
}

/**
 * Aggregation configuration
 */
export interface AggregationConfig {
  timeWindow: TimeWindow;
  priceGrouping: number; // group prices by this increment
  minTradeSize: number;  // filter out dust trades
  whaleThreshold: number; // USD threshold for whale classification
  updateInterval: number; // ms between aggregation updates
}

/**
 * Storage schema for persistence
 */
export interface StoredFlowData {
  key: string; // e.g., "flow:BTC:5m:1234567890"
  coin: Coin;
  timeWindow: TimeWindow;
  timestamp: number;
  data: {
    nodes: Array<[number, LiquidityNode]>; // serialized Map
    metrics: FlowMetrics;
    timeSeries: FlowTimePoint[];
  };
  expiresAt: number; // TTL timestamp
}

/**
 * Collector state for tracking
 */
export interface CollectorState {
  isCollecting: boolean;
  lastUpdate: number | null;
  tradesProcessed: number;
  liquidationsProcessed: number;
  errors: CollectorError[];
}

/**
 * Error tracking
 */
export interface CollectorError {
  timestamp: number;
  type: 'websocket' | 'parsing' | 'storage' | 'classification';
  message: string;
  details?: any;
}
