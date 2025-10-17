'use client';

// Main hook for liquidity flow data collection and management

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Coin,
  TimeWindow,
  FlowData,
  FlowMetrics,
  FlowTimePoint,
  CollectorState,
} from '../types';
import {
  getTradeCollector,
  getLiquidationCollector,
  getDataAggregator,
} from '../services';

export interface UseLiquidityFlowDataOptions {
  coin: Coin;
  timeWindow: TimeWindow;
  autoSave?: boolean;
  updateInterval?: number;
}

export interface UseLiquidityFlowDataReturn {
  flowData: FlowData | null;
  metrics: FlowMetrics | null;
  timeSeries: FlowTimePoint[];
  isCollecting: boolean;
  lastUpdate: Date | null;
  state: CollectorState;
  refresh: () => void;
  clearData: () => void;
}

/**
 * Hook for managing liquidity flow data collection
 */
export function useLiquidityFlowData({
  coin,
  timeWindow,
  autoSave = false,
  updateInterval = 1000,
}: UseLiquidityFlowDataOptions): UseLiquidityFlowDataReturn {
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const [metrics, setMetrics] = useState<FlowMetrics | null>(null);
  const [timeSeries, setTimeSeries] = useState<FlowTimePoint[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [state, setState] = useState<CollectorState>({
    isCollecting: false,
    lastUpdate: null,
    tradesProcessed: 0,
    liquidationsProcessed: 0,
    errors: [],
  });

  const tradeCollectorRef = useRef(getTradeCollector());
  const liquidationCollectorRef = useRef(getLiquidationCollector());
  const aggregatorRef = useRef(getDataAggregator());
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update flow data from aggregator
   */
  const updateFlowData = useCallback(() => {
    try {
      const data = aggregatorRef.current.getFlowData(coin, timeWindow);
      const series = aggregatorRef.current.getTimeSeries(coin, timeWindow);

      setFlowData(data);
      setMetrics(data.metrics);
      setTimeSeries(series);
      setLastUpdate(new Date());

      setState(prev => ({
        ...prev,
        lastUpdate: Date.now(),
      }));
    } catch (error) {
      console.error('[useLiquidityFlowData] Update error:', error);
      setState(prev => ({
        ...prev,
        errors: [
          ...prev.errors,
          {
            timestamp: Date.now(),
            type: 'classification' as const,
            message: 'Failed to update flow data',
            details: error,
          },
        ].slice(-10), // Keep last 10 errors
      }));
    }
  }, [coin, timeWindow]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    updateFlowData();
  }, [updateFlowData]);

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    aggregatorRef.current.clearCoin(coin);
    setFlowData(null);
    setMetrics(null);
    setTimeSeries([]);
    setState(prev => ({
      ...prev,
      tradesProcessed: 0,
      liquidationsProcessed: 0,
    }));
  }, [coin]);

  /**
   * Setup data collection
   */
  useEffect(() => {
    setIsCollecting(true);

    // Trade callback
    const handleTrade = (trade: any) => {
      aggregatorRef.current.addTrade(trade);
      setState(prev => ({
        ...prev,
        tradesProcessed: prev.tradesProcessed + 1,
      }));
    };

    // Liquidation callback
    const handleLiquidation = (liquidation: any) => {
      aggregatorRef.current.addLiquidation(liquidation);
      setState(prev => ({
        ...prev,
        liquidationsProcessed: prev.liquidationsProcessed + 1,
      }));
    };

    // Subscribe to data
    tradeCollectorRef.current.subscribe(coin, handleTrade);
    liquidationCollectorRef.current.subscribe(coin, handleLiquidation);

    // Setup update timer
    updateTimerRef.current = setInterval(() => {
      updateFlowData();
    }, updateInterval);

    // Initial update
    updateFlowData();

    setState(prev => ({
      ...prev,
      isCollecting: true,
    }));

    // Cleanup
    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }

      tradeCollectorRef.current.unsubscribe(coin, handleTrade);
      liquidationCollectorRef.current.unsubscribe(coin, handleLiquidation);

      setState(prev => ({
        ...prev,
        isCollecting: false,
      }));

      setIsCollecting(false);
    };
  }, [coin, timeWindow, updateInterval, updateFlowData]);

  /**
   * Periodic data pruning
   */
  useEffect(() => {
    const pruneInterval = setInterval(() => {
      aggregatorRef.current.pruneOldData();
    }, 60000); // Prune every minute

    return () => clearInterval(pruneInterval);
  }, []);

  return {
    flowData,
    metrics,
    timeSeries,
    isCollecting,
    lastUpdate,
    state,
    refresh,
    clearData,
  };
}
