// Core Types and Interfaces for Backtesting Module

export type PositionSide = 'long' | 'short';
export type SignalDirection = 'buy' | 'sell';
export type MarketRegime = 'bull' | 'bear' | 'sideways';
export type StrategyType = 'fundingRateExtreme' | 'oiExpansion' | 'liquidationClusters' | 'crossAssetCorrelation';

// Market Data Structures
export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundingRate {
  timestamp: number;
  rate: number; // hourly rate
  coin: string;
}

export interface OpenInterest {
  timestamp: number;
  value: number; // USD value
  coin: string;
}

export interface Liquidation {
  timestamp: number;
  side: PositionSide;
  amount: number; // USD value
  price: number;
  coin: string;
}

export interface MarketData {
  candles: Candle[];
  fundingRates: FundingRate[];
  openInterest: OpenInterest[];
  liquidations: Liquidation[];
}

// Position Management
export interface Position {
  id: string;
  coin: string;
  side: PositionSide;
  entryPrice: number;
  entryTime: number;
  size: number; // USD value
  leverage: number;
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  fundingPaid: number; // accumulated funding
}

export interface Trade {
  id: string;
  coin: string;
  side: PositionSide;
  entryPrice: number;
  exitPrice: number;
  entryTime: number;
  exitTime: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  slippage: number;
  funding: number;
  totalCost: number;
  holdingTime: number; // hours
  exitReason: 'takeProfit' | 'stopLoss' | 'signal' | 'endOfPeriod';
}

// Strategy Signals
export interface Signal {
  timestamp: number;
  coin: string;
  type: 'entry' | 'exit';
  direction: PositionSide;
  confidence: number; // 0-1
  reason: string;
  metadata?: Record<string, any>;
}

// Configuration
export interface RiskConfig {
  initialCapital: number;
  positionSize: number; // percentage of capital
  leverage: number;
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  maxPositions: number;
}

export interface CostConfig {
  takerFee: number;
  makerFee: number;
  feeMultiplier: number;
  slippageBase: number;
  slippageVolatility: number;
  fundingAssumption: 'negative' | 'neutral' | 'positive';
}

export interface BacktestConfig {
  coin: string;
  startDate: Date;
  endDate: Date;
  strategy: StrategyType;
  riskConfig: RiskConfig;
  costConfig: CostConfig;
  interval: '15m' | '1h' | '4h' | '1d';
}

// Performance Metrics
export interface RegimeStats {
  totalPnL: number;
  totalPnLPercent: number;
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  sharpeRatio: number;
}

export interface BacktestMetrics {
  // Core metrics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  
  // Risk metrics
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxDrawdownDuration: number; // days
  
  // Quality metrics
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgWinPercent: number;
  avgLossPercent: number;
  
  // Consistency metrics
  winStreak: number;
  lossStreak: number;
  avgHoldingTime: number; // hours
  
  // Cost metrics
  totalFees: number;
  totalSlippage: number;
  totalFunding: number;
  totalCosts: number;
  
  // Regime-specific
  bullPerformance: RegimeStats;
  bearPerformance: RegimeStats;
  sidewaysPerformance: RegimeStats;
  
  // Additional
  expectancy: number; // average PnL per trade
  riskRewardRatio: number; // avgWin / avgLoss
}

// Validation and Red Flags
export enum RedFlag {
  SHARPE_TOO_HIGH = 'Sharpe ratio >3.0 (sospechoso de overfitting)',
  WIN_RATE_TOO_HIGH = 'Win rate >70% (poco realista)',
  INSUFFICIENT_TRADES = 'Menos de 100 trades (muestra insuficiente)',
  REGIME_FAILURE = 'Falla completamente en algún régimen (bull/bear/sideways)',
  TRAIN_TEST_DIVERGENCE = 'Diferencia train/test >30%',
  COST_SENSITIVITY = 'Falla con costos 2x mayores',
  CONCENTRATED_WINS = '>50% de ganancias en <10% de trades',
  NO_STRESS_SURVIVAL = 'No sobrevive flash crash o funding extremo',
  MAX_DRAWDOWN_TOO_HIGH = 'Max drawdown >30%',
  LOW_PROFIT_FACTOR = 'Profit factor <1.5'
}

export interface Warning {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  passed: boolean;
  redFlags: RedFlag[];
  warnings: Warning[];
  score: number; // 0-100
}

// Backtest Results
export interface EquityPoint {
  timestamp: number;
  equity: number;
  pnl: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  metrics: BacktestMetrics;
  trades: Trade[];
  equityCurve: EquityPoint[];
  validation: ValidationResult;
  startTime: number;
  endTime: number;
  duration: number; // ms
}

// Stress Test
export interface StressTest {
  name: string;
  description: string;
  passed: boolean;
  originalMetrics: Partial<BacktestMetrics>;
  stressedMetrics: Partial<BacktestMetrics>;
  degradation: number; // percentage
}

export interface StressTestResults {
  tests: StressTest[];
  overallPassed: boolean;
  worstCase: StressTest;
}

// Walk-Forward Analysis
export interface WalkForwardWindow {
  trainPeriod: [Date, Date];
  testPeriod: [Date, Date];
  trainMetrics: BacktestMetrics;
  testMetrics: BacktestMetrics;
  degradation: number;
}

export interface WalkForwardResult {
  windows: WalkForwardWindow[];
  avgDegradation: number;
  consistent: boolean;
}

// Default Configurations
export const DEFAULT_RISK_CONFIG: RiskConfig = {
  initialCapital: 10000,
  positionSize: 10, // 10%
  leverage: 3,
  stopLoss: 1.5, // 1.5%
  takeProfit: 3, // 3%
  maxPositions: 1
};

export const DEFAULT_COST_CONFIG: CostConfig = {
  takerFee: 0.0007, // 0.07%
  makerFee: 0.0005, // 0.05%
  feeMultiplier: 1.5,
  slippageBase: 0.0005, // 0.05%
  slippageVolatility: 0.0003, // 0.03%
  fundingAssumption: 'negative'
};

export const DAY_TRADING_THRESHOLDS = {
  minSharpe: 1.5,
  maxSharpe: 3.0,
  minWinRate: 0.45,
  maxWinRate: 0.65,
  maxDrawdown: 0.20, // 20%
  minProfitFactor: 1.5,
  minTrades: 100,
  maxTrainTestDiff: 0.30
};
