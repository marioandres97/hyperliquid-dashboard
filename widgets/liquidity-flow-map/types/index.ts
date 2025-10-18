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

/**
 * Phase 3: Enhanced Features Types
 */

/**
 * Absorption zone - area where large orders absorb market flow
 */
export interface AbsorptionZone {
  id: string;
  price: number;
  priceRange: [number, number]; // min, max
  volume: number;
  side: 'buy' | 'sell';
  strength: number; // 0-100
  timestamp: number;
  tradeCount: number;
  whaleActivity: boolean;
  status: 'active' | 'breached' | 'absorbed';
}

/**
 * Liquidation cascade risk assessment
 */
export interface LiquidationCascade {
  id: string;
  priceLevel: number;
  risk: 'high' | 'medium' | 'low';
  estimatedVolume: number;
  liquidationCount: number;
  side: 'long' | 'short';
  timestamp: number;
  triggerPrice?: number;
  affectedLevels: number[]; // prices that could cascade
}

/**
 * Support/Resistance level
 */
export interface SupportResistanceLevel {
  id: string;
  price: number;
  type: 'support' | 'resistance';
  strength: number; // 0-100, based on touch count and volume
  touchCount: number;
  volume: number;
  firstTouch: number; // timestamp
  lastTouch: number;  // timestamp
  isBreached: boolean;
  breachTimestamp?: number;
}

/**
 * Pattern types for detection
 */
export type PatternType = 
  | 'absorption_zone'
  | 'liquidation_cascade'
  | 'support_level'
  | 'resistance_level'
  | 'whale_accumulation'
  | 'whale_distribution'
  | 'breakout'
  | 'breakdown';

/**
 * Detected pattern
 */
export interface DetectedPattern {
  id: string;
  type: PatternType;
  timestamp: number;
  price: number;
  strength: number;
  confidence: number;
  description: string;
  metadata: Record<string, any>;
}

/**
 * Alert severity levels
 */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Alert for significant market events
 */
export interface Alert {
  id: string;
  coin: Coin;
  type: PatternType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: number;
  price: number;
  metadata: Record<string, any>;
  acknowledged: boolean;
  expiresAt?: number;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  minSeverity: AlertSeverity;
  patterns: PatternType[];
  notificationSound: boolean;
  autoAcknowledge: boolean;
  autoAcknowledgeDelay?: number; // ms
}

/**
 * Phase 4: Advanced Analytics Types
 */

/**
 * Playback state for historical data
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  startTime: number;
  endTime: number;
  speed: number; // 0.5, 1, 2, 4
  direction: 'forward' | 'backward';
}

/**
 * Historical snapshot for time travel
 */
export interface HistoricalSnapshot {
  timestamp: number;
  flowData: FlowData;
  patterns: DetectedPattern[];
  alerts: Alert[];
  price: number;
}

/**
 * Volume Profile data
 */
export interface VolumeProfile {
  coin: Coin;
  timestamp: number;
  priceLevel: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  trades: number;
  deltaVolume: number; // buy - sell
}

/**
 * Volume Profile markers (POC, VAH, VAL)
 */
export interface VolumeProfileMarkers {
  poc: number; // Point of Control - price with highest volume
  vah: number; // Value Area High - top 70% volume
  val: number; // Value Area Low - bottom 70% volume
  totalVolume: number;
  valueAreaVolume: number; // 70% of total
  profiles: VolumeProfile[];
}

/**
 * Mean reversion setup
 */
export interface MeanReversionSetup {
  id: string;
  coin: Coin;
  timestamp: number;
  type: 'overbought' | 'oversold';
  currentPrice: number;
  meanPrice: number;
  deviation: number; // standard deviations from mean
  reversionProbability: number; // 0-1
  targetPrice: number;
  strength: number; // 0-100
  metadata: {
    volumeConfirmation: boolean;
    patternConfirmation: boolean;
    timeframe: TimeWindow;
  };
}

/**
 * Trade setup combining all analytics
 */
export interface TradeSetup {
  id: string;
  coin: Coin;
  timestamp: number;
  type: 'long' | 'short';
  quality: number; // 0-100 overall score
  confidence: number; // 0-1
  
  // Entry/Exit/Stop levels
  entry: number;
  target1: number;
  target2: number;
  stopLoss: number;
  riskRewardRatio: number;
  
  // Supporting analytics
  patterns: DetectedPattern[];
  volumeProfile?: VolumeProfileMarkers;
  meanReversion?: MeanReversionSetup;
  absorptionZones?: AbsorptionZone[];
  supportResistance?: SupportResistanceLevel[];
  
  // Metadata
  description: string;
  reasoning: string[];
  risks: string[];
  timeframe: TimeWindow;
  status: 'active' | 'triggered' | 'completed' | 'stopped' | 'expired';
}

/**
 * Setup performance tracking
 */
export interface SetupPerformance {
  setupId: string;
  entryTime?: number;
  entryPrice?: number;
  exitTime?: number;
  exitPrice?: number;
  highPrice: number;
  lowPrice: number;
  pnl: number; // percentage
  status: 'open' | 'win' | 'loss' | 'breakeven';
  maxDrawdown: number;
  maxProfit: number;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  format: 'screenshot' | 'video' | 'csv' | 'json' | 'pdf';
  includePatterns: boolean;
  includeMetrics: boolean;
  includeSetups: boolean;
  timeRange?: {
    start: number;
    end: number;
  };
}

/**
 * Export result
 */
export interface ExportResult {
  format: ExportConfig['format'];
  data: Blob | string;
  filename: string;
  timestamp: number;
}

/**
 * Candlestick data for price chart
 */
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  side: 'buy' | 'sell' | 'neutral'; // dominant side for this candle
}

/**
 * Trade bubble for large trades visualization
 */
export interface TradeBubble {
  id: string;
  timestamp: number;
  price: number;
  size: number;
  notional: number; // USD value
  side: 'buy' | 'sell';
  radius: number; // calculated based on size
  opacity: number; // for fade in/out animation
  createdAt: number; // when bubble was created
  expiresAt: number; // when bubble should fade out
}
