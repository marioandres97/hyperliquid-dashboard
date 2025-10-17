// Data aggregator service for combining and processing trade and liquidation data

import {
  Coin,
  TimeWindow,
  FlowData,
  ClassifiedTrade,
  ClassifiedLiquidation,
  AggregationConfig,
  FlowMetrics,
  FlowTimePoint,
} from '../types';
import {
  aggregateTradesToNodes,
  addLiquidationsToNodes,
  calculateFlowMetrics,
  createTimeSeries,
  filterTradesByTime,
  filterLiquidationsByTime,
} from '../utils';

const TIME_WINDOW_MS: Record<TimeWindow, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
};

const DEFAULT_PRICE_GROUPING: Record<Coin, number> = {
  BTC: 10,    // Group by $10
  ETH: 1,     // Group by $1
  HYPE: 0.1,  // Group by $0.10
};

/**
 * Data aggregator for real-time flow analysis
 */
export class DataAggregator {
  private trades: Map<Coin, ClassifiedTrade[]> = new Map();
  private liquidations: Map<Coin, ClassifiedLiquidation[]> = new Map();
  private readonly maxTradesPerCoin = 10000;
  private readonly maxLiquidationsPerCoin = 1000;

  constructor(private config?: Partial<AggregationConfig>) {}

  /**
   * Add a trade to the aggregator
   */
  addTrade(trade: ClassifiedTrade): void {
    const trades = this.trades.get(trade.coin) || [];
    trades.push(trade);

    // Keep only recent trades
    if (trades.length > this.maxTradesPerCoin) {
      trades.shift();
    }

    this.trades.set(trade.coin, trades);
  }

  /**
   * Add a liquidation to the aggregator
   */
  addLiquidation(liquidation: ClassifiedLiquidation): void {
    const liquidations = this.liquidations.get(liquidation.coin) || [];
    liquidations.push(liquidation);

    // Keep only recent liquidations
    if (liquidations.length > this.maxLiquidationsPerCoin) {
      liquidations.shift();
    }

    this.liquidations.set(liquidation.coin, liquidations);
  }

  /**
   * Get aggregated flow data for a coin and time window
   */
  getFlowData(coin: Coin, timeWindow: TimeWindow): FlowData {
    const windowMs = this.config?.timeWindow 
      ? TIME_WINDOW_MS[this.config.timeWindow]
      : TIME_WINDOW_MS[timeWindow];
    
    const endTime = Date.now();
    const startTime = endTime - windowMs;

    // Filter data by time window
    const allTrades = this.trades.get(coin) || [];
    const allLiquidations = this.liquidations.get(coin) || [];

    const windowTrades = filterTradesByTime(allTrades, startTime, endTime);
    const windowLiquidations = filterLiquidationsByTime(allLiquidations, startTime, endTime);

    // Filter by minimum trade size if configured
    const filteredTrades = this.config?.minTradeSize
      ? windowTrades.filter(t => t.notional >= this.config!.minTradeSize!)
      : windowTrades;

    // Aggregate to liquidity nodes
    const priceGrouping = this.config?.priceGrouping || DEFAULT_PRICE_GROUPING[coin];
    let nodes = aggregateTradesToNodes(filteredTrades, priceGrouping);
    nodes = addLiquidationsToNodes(nodes, windowLiquidations, priceGrouping);

    // Calculate metrics
    const metrics = calculateFlowMetrics(filteredTrades, windowLiquidations, nodes);

    return {
      coin,
      timeWindow,
      startTime,
      endTime,
      nodes,
      trades: filteredTrades,
      liquidations: windowLiquidations,
      metrics,
    };
  }

  /**
   * Get time series data for visualization
   */
  getTimeSeries(coin: Coin, timeWindow: TimeWindow, intervalMs: number = 60000): FlowTimePoint[] {
    const windowMs = TIME_WINDOW_MS[timeWindow];
    const endTime = Date.now();
    const startTime = endTime - windowMs;

    const allTrades = this.trades.get(coin) || [];
    const allLiquidations = this.liquidations.get(coin) || [];

    const windowTrades = filterTradesByTime(allTrades, startTime, endTime);
    const windowLiquidations = filterLiquidationsByTime(allLiquidations, startTime, endTime);

    return createTimeSeries(windowTrades, windowLiquidations, intervalMs);
  }

  /**
   * Get current metrics without full aggregation
   */
  getCurrentMetrics(coin: Coin, timeWindow: TimeWindow): FlowMetrics {
    const flowData = this.getFlowData(coin, timeWindow);
    return flowData.metrics;
  }

  /**
   * Clear data for a specific coin
   */
  clearCoin(coin: Coin): void {
    this.trades.delete(coin);
    this.liquidations.delete(coin);
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.trades.clear();
    this.liquidations.clear();
  }

  /**
   * Get data counts for monitoring
   */
  getDataCounts(): Record<Coin, { trades: number; liquidations: number }> {
    const counts: any = {};
    
    (['BTC', 'ETH', 'HYPE'] as Coin[]).forEach(coin => {
      counts[coin] = {
        trades: (this.trades.get(coin) || []).length,
        liquidations: (this.liquidations.get(coin) || []).length,
      };
    });

    return counts;
  }

  /**
   * Prune old data to manage memory
   */
  pruneOldData(maxAgeMs: number = 4 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAgeMs;

    // Prune trades
    this.trades.forEach((trades, coin) => {
      const filtered = trades.filter(t => t.timestamp >= cutoffTime);
      if (filtered.length === 0) {
        this.trades.delete(coin);
      } else {
        this.trades.set(coin, filtered);
      }
    });

    // Prune liquidations
    this.liquidations.forEach((liquidations, coin) => {
      const filtered = liquidations.filter(l => l.timestamp >= cutoffTime);
      if (filtered.length === 0) {
        this.liquidations.delete(coin);
      } else {
        this.liquidations.set(coin, filtered);
      }
    });
  }
}

// Singleton instance
let aggregatorInstance: DataAggregator | null = null;

/**
 * Get the global data aggregator instance
 */
export function getDataAggregator(config?: Partial<AggregationConfig>): DataAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new DataAggregator(config);
  }
  return aggregatorInstance;
}
