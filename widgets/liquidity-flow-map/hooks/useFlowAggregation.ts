'use client';

// Hook for advanced flow data aggregation

import { useState, useEffect, useCallback } from 'react';
import {
  Coin,
  TimeWindow,
  LiquidityNode,
  ClassifiedTrade,
  ClassifiedLiquidation,
} from '../types';

export interface UseFlowAggregationOptions {
  coin: Coin;
  timeWindow: TimeWindow;
  priceGrouping?: number;
  enabled?: boolean;
}

export interface UseFlowAggregationReturn {
  nodes: Map<number, LiquidityNode>;
  topBuyLevels: [number, LiquidityNode][];
  topSellLevels: [number, LiquidityNode][];
  whaleLevels: [number, LiquidityNode][];
  liquidationLevels: [number, LiquidityNode][];
  getTrades: () => ClassifiedTrade[];
  getLiquidations: () => ClassifiedLiquidation[];
}

/**
 * Hook for aggregating and analyzing flow data at price levels
 */
export function useFlowAggregation({
  coin,
  timeWindow,
  priceGrouping = 1,
  enabled = true,
}: UseFlowAggregationOptions): UseFlowAggregationReturn {
  const [nodes, setNodes] = useState<Map<number, LiquidityNode>>(new Map());
  const [trades, setTrades] = useState<ClassifiedTrade[]>([]);
  const [liquidations, setLiquidations] = useState<ClassifiedLiquidation[]>([]);

  /**
   * Get top buy levels by volume
   */
  const topBuyLevels = useState(() => {
    const buyNodes = Array.from(nodes.entries())
      .filter(([_, node]) => node.dominantSide === 'buy')
      .sort((a, b) => b[1].buyVolume - a[1].buyVolume)
      .slice(0, 10);
    return buyNodes;
  })[0];

  /**
   * Get top sell levels by volume
   */
  const topSellLevels = useState(() => {
    const sellNodes = Array.from(nodes.entries())
      .filter(([_, node]) => node.dominantSide === 'sell')
      .sort((a, b) => b[1].sellVolume - a[1].sellVolume)
      .slice(0, 10);
    return sellNodes;
  })[0];

  /**
   * Get price levels with whale activity
   */
  const whaleLevels = useState(() => {
    return Array.from(nodes.entries())
      .filter(([_, node]) => node.whaleActivity)
      .sort((a, b) => Math.abs(b[1].netFlow) - Math.abs(a[1].netFlow));
  })[0];

  /**
   * Get price levels with liquidations
   */
  const liquidationLevels = useState(() => {
    return Array.from(nodes.entries())
      .filter(([_, node]) => node.liquidations > 0)
      .sort((a, b) => b[1].liquidations - a[1].liquidations);
  })[0];

  /**
   * Get trades accessor
   */
  const getTrades = useCallback(() => trades, [trades]);

  /**
   * Get liquidations accessor
   */
  const getLiquidations = useCallback(() => liquidations, [liquidations]);

  return {
    nodes,
    topBuyLevels,
    topSellLevels,
    whaleLevels,
    liquidationLevels,
    getTrades,
    getLiquidations,
  };
}
