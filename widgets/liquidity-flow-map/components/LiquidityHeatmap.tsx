'use client';

import React, { useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { LiquidityNode } from '../types';

export interface LiquidityHeatmapProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
}

export function LiquidityHeatmap({ nodes, currentPrice }: LiquidityHeatmapProps) {
  // Convert nodes to sorted array for visualization
  const sortedNodes = useMemo(() => {
    const nodeArray = Array.from(nodes.values());
    return nodeArray.sort((a, b) => b.price - a.price);
  }, [nodes]);

  if (sortedNodes.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Liquidity Heatmap</h3>
        <p className="text-white/60 text-center py-12">No liquidity data available</p>
      </div>
    );
  }

  // Calculate max values for normalization
  const maxBuyVolume = Math.max(...sortedNodes.map(n => n.buyVolume), 1);
  const maxSellVolume = Math.max(...sortedNodes.map(n => n.sellVolume), 1);
  const maxNetFlow = Math.max(...sortedNodes.map(n => Math.abs(n.netFlow)), 1);

  // Helper to get color intensity based on volume
  const getNodeColor = (node: LiquidityNode) => {
    const netFlow = node.netFlow;
    const intensity = Math.abs(netFlow) / maxNetFlow;
    
    if (netFlow > 0) {
      // Buying pressure - green
      const alpha = Math.min(intensity * 0.8, 0.8);
      return `rgba(16, 185, 129, ${alpha})`;
    } else if (netFlow < 0) {
      // Selling pressure - red
      const alpha = Math.min(intensity * 0.8, 0.8);
      return `rgba(239, 68, 68, ${alpha})`;
    } else {
      // Neutral - gray
      return 'rgba(107, 114, 128, 0.3)';
    }
  };

  // Helper to get node height based on total volume
  const getNodeHeight = (node: LiquidityNode) => {
    const totalVolume = node.buyVolume + node.sellVolume;
    const maxVolume = Math.max(maxBuyVolume, maxSellVolume);
    const height = (totalVolume / maxVolume) * 80 + 20; // Min 20px, max 100px
    return Math.min(height, 100);
  };

  // Helper to format price
  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper to format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Liquidity Heatmap</h3>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/60 rounded"></div>
            <span>Buying</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/60 rounded"></div>
            <span>Selling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500/30 rounded"></div>
            <span>Neutral</span>
          </div>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg border border-white/10 overflow-hidden" style={{ height: '500px' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => zoomIn()}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                  title="Zoom In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                  title="Zoom Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                  title="Reset"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <div className="p-4 min-h-full">
                  {/* Price levels */}
                  {sortedNodes.map((node, index) => {
                    const isCurrentPrice = currentPrice && Math.abs(node.price - currentPrice) < 1;
                    const height = getNodeHeight(node);
                    
                    return (
                      <div
                        key={node.price}
                        className={`flex items-center gap-4 mb-2 p-2 rounded-lg transition-all hover:scale-105 ${
                          isCurrentPrice ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        style={{
                          backgroundColor: getNodeColor(node),
                          minHeight: `${height}px`,
                        }}
                        title={`Price: $${formatPrice(node.price)}\nBuy: ${formatVolume(node.buyVolume)}\nSell: ${formatVolume(node.sellVolume)}\nNet: ${formatVolume(node.netFlow)}\nTrades: ${node.buyCount + node.sellCount}`}
                      >
                        {/* Price Label */}
                        <div className="min-w-[100px] text-white font-mono text-sm font-bold">
                          ${formatPrice(node.price)}
                          {isCurrentPrice && <span className="ml-2 text-yellow-400">●</span>}
                        </div>

                        {/* Volume Bars */}
                        <div className="flex-1 flex gap-2">
                          {/* Buy Volume Bar */}
                          <div className="flex-1">
                            <div
                              className="bg-green-500/60 rounded h-6 flex items-center justify-end pr-2"
                              style={{ width: `${(node.buyVolume / maxBuyVolume) * 100}%` }}
                            >
                              <span className="text-white text-xs font-semibold">
                                {node.buyVolume > 0 && formatVolume(node.buyVolume)}
                              </span>
                            </div>
                          </div>

                          {/* Sell Volume Bar */}
                          <div className="flex-1 flex justify-end">
                            <div
                              className="bg-red-500/60 rounded h-6 flex items-center justify-start pl-2"
                              style={{ width: `${(node.sellVolume / maxSellVolume) * 100}%` }}
                            >
                              <span className="text-white text-xs font-semibold">
                                {node.sellVolume > 0 && formatVolume(node.sellVolume)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Trade Count */}
                        <div className="min-w-[60px] text-right text-white/80 text-xs">
                          {node.buyCount + node.sellCount} trades
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Price Levels</div>
          <div className="text-lg font-bold text-white">{sortedNodes.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Total Volume</div>
          <div className="text-lg font-bold text-cyan-400">
            {formatVolume(sortedNodes.reduce((sum, n) => sum + n.buyVolume + n.sellVolume, 0))}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Current Price</div>
          <div className="text-lg font-bold text-yellow-400">
            {currentPrice ? `$${formatPrice(currentPrice)}` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
