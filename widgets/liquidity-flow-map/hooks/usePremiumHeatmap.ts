/**
 * Hook for Premium Heatmap functionality
 */

import { useMemo, useState, useCallback } from 'react';
import { LiquidityNode } from '../types';

export interface UsePremiumHeatmapProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
}

export function usePremiumHeatmap({ nodes, currentPrice }: UsePremiumHeatmapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Sort and process nodes
  const sortedNodes = useMemo(() => {
    const nodeArray = Array.from(nodes.values());
    return nodeArray.sort((a, b) => b.price - a.price);
  }, [nodes]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const maxBuyVolume = Math.max(...sortedNodes.map(n => n.buyVolume), 1);
    const maxSellVolume = Math.max(...sortedNodes.map(n => n.sellVolume), 1);
    const maxNetFlow = Math.max(...sortedNodes.map(n => Math.abs(n.netFlow)), 1);
    const maxVolume = Math.max(maxBuyVolume, maxSellVolume);

    const totalBuyVolume = sortedNodes.reduce((sum, n) => sum + n.buyVolume, 0);
    const totalSellVolume = sortedNodes.reduce((sum, n) => sum + n.sellVolume, 0);

    return {
      maxBuyVolume,
      maxSellVolume,
      maxNetFlow,
      maxVolume,
      totalBuyVolume,
      totalSellVolume,
      nodeCount: sortedNodes.length,
    };
  }, [sortedNodes]);

  // Price range
  const priceRange = useMemo((): [number, number] => {
    if (sortedNodes.length === 0) return [0, 0];
    const prices = sortedNodes.map(n => n.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [sortedNodes]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setScrollOffset(0);
  }, []);

  // Scroll controls
  const scrollUp = useCallback(() => {
    setScrollOffset(prev => Math.max(prev - 50, 0));
  }, []);

  const scrollDown = useCallback(() => {
    setScrollOffset(prev => prev + 50);
  }, []);

  return {
    sortedNodes,
    metrics,
    priceRange,
    zoomLevel,
    scrollOffset,
    zoomIn,
    zoomOut,
    resetZoom,
    scrollUp,
    scrollDown,
    setScrollOffset,
  };
}
