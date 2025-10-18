'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { LiquidityNode, AbsorptionZone, SupportResistanceLevel } from '../../types';
import { HeatmapRenderer } from '../../utils/canvas/heatmapRenderer';
import { VolumeProfileRenderer } from '../../utils/canvas/volumeProfileRenderer';
import { usePremiumHeatmap } from '../../hooks/usePremiumHeatmap';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { heatmapVariants } from '@/lib/effects/premium-effects';

export interface PremiumLiquidityHeatmapProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
  absorptionZones?: AbsorptionZone[];
  supportResistanceLevels?: SupportResistanceLevel[];
  showPatterns?: boolean;
  height?: number;
  priceRange?: [number, number];
}

export function PremiumLiquidityHeatmap({
  nodes,
  currentPrice,
  absorptionZones = [],
  supportResistanceLevels = [],
  showPatterns = true,
  height = 600,
}: PremiumLiquidityHeatmapProps) {
  const [hoveredNode, setHoveredNode] = useState<LiquidityNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    sortedNodes,
    metrics,
    priceRange,
    zoomLevel,
    scrollOffset,
    zoomIn,
    zoomOut,
    resetZoom,
  } = usePremiumHeatmap({ nodes, currentPrice });

  // Canvas setup (without onRender initially)
  const { canvasRef, ctx, render, pixelRatio } = useCanvasRenderer({
    width: containerRef.current?.clientWidth || 1200,
    height: height,
  });

  // Separate render effect
  useEffect(() => {
    if (!ctx || sortedNodes.length === 0) return;

    const renderer = new HeatmapRenderer(ctx, {
      width: containerRef.current?.clientWidth || 1200,
      height: height,
      priceRange,
      maxVolume: metrics.maxVolume,
      pixelRatio,
    });

    // Clear canvas
    ctx.clearRect(0, 0, containerRef.current?.clientWidth || 1200, height);

    // Draw background
    renderer.drawBackground();

    // Calculate row height
    const rowHeight = Math.max(30, (height / sortedNodes.length) * zoomLevel);
    const visibleStart = Math.floor(scrollOffset / rowHeight);
    const visibleEnd = Math.ceil((scrollOffset + height) / rowHeight);

    // Draw visible nodes
    sortedNodes.slice(visibleStart, visibleEnd).forEach((node, index) => {
      const actualIndex = visibleStart + index;
      const y = actualIndex * rowHeight - scrollOffset;

      if (y < -rowHeight || y > height) return;

      const isCurrent = currentPrice && Math.abs(node.price - currentPrice) < 1;

      // Draw price label
      renderer.drawPriceLabel(node.price, y, rowHeight, !!isCurrent);

      // Draw main heatmap bar
      renderer.drawNode(node, y, rowHeight);

      // Draw volume bars
      renderer.drawVolumeBar(node.buyVolume, node.sellVolume, y, rowHeight);
    });
  }, [ctx, sortedNodes, metrics, priceRange, zoomLevel, scrollOffset, height, currentPrice, pixelRatio]);

  // Mouse move handler for tooltips
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x: e.clientX, y: e.clientY });

    // Find hovered node
    const rowHeight = Math.max(30, (height / sortedNodes.length) * zoomLevel);
    const nodeIndex = Math.floor((y + scrollOffset) / rowHeight);
    
    if (nodeIndex >= 0 && nodeIndex < sortedNodes.length) {
      setHoveredNode(sortedNodes[nodeIndex]);
    } else {
      setHoveredNode(null);
    }
  }, [canvasRef, sortedNodes, zoomLevel, scrollOffset, height]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
        case '_':
          zoomOut();
          break;
        case 'r':
        case 'R':
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  if (sortedNodes.length === 0) {
    return (
      <motion.div 
        className="premium-glass rounded-xl p-6"
        variants={heatmapVariants}
        initial="hidden"
        animate="show"
      >
        <h3 className="text-xl font-semibold text-white mb-4" style={{ color: premiumTheme.accent.gold }}>
          Premium Liquidity Heatmap
        </h3>
        <p className="text-white/60 text-center py-12">No liquidity data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="premium-glass rounded-xl p-6"
      variants={heatmapVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold" style={{ color: premiumTheme.accent.gold }}>
          Premium Liquidity Heatmap
        </h3>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomIn}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: premiumTheme.background.tertiary,
              color: premiumTheme.accent.platinum,
              border: `1px solid ${premiumTheme.borders.medium}`,
            }}
            title="Zoom In (+)"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: premiumTheme.background.tertiary,
              color: premiumTheme.accent.platinum,
              border: `1px solid ${premiumTheme.borders.medium}`,
            }}
            title="Zoom Out (-)"
          >
            −
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: premiumTheme.background.tertiary,
              color: premiumTheme.accent.platinum,
              border: `1px solid ${premiumTheme.borders.medium}`,
            }}
            title="Reset (R)"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: premiumTheme.trading.buy.base }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Buying Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: premiumTheme.trading.sell.base }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Selling Pressure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: premiumTheme.accent.gold }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Whale Activity</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden" style={{ 
        border: `1px solid ${premiumTheme.borders.medium}`,
        backgroundColor: premiumTheme.background.primary,
      }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block', cursor: 'crosshair' }}
        />

        {/* Tooltip */}
        {hoveredNode && (
          <div
            className="absolute z-10 px-4 py-3 rounded-lg text-sm pointer-events-none"
            style={{
              left: mousePos.x + 20,
              top: mousePos.y - 100,
              backgroundColor: premiumTheme.background.glass,
              border: `1px solid ${premiumTheme.borders.strong}`,
              backdropFilter: 'blur(12px)',
              boxShadow: premiumTheme.borders.glow,
            }}
          >
            <div className="font-mono font-bold mb-2" style={{ color: premiumTheme.accent.gold }}>
              ${hoveredNode.price.toFixed(2)}
            </div>
            <div className="space-y-1 text-xs">
              <div style={{ color: premiumTheme.trading.buy.base }}>
                Buy: ${formatVolume(hoveredNode.buyVolume)} ({hoveredNode.buyCount})
              </div>
              <div style={{ color: premiumTheme.trading.sell.base }}>
                Sell: ${formatVolume(hoveredNode.sellVolume)} ({hoveredNode.sellCount})
              </div>
              <div style={{ color: premiumTheme.accent.platinum }}>
                Net: ${formatVolume(hoveredNode.netFlow)}
              </div>
              {hoveredNode.whaleActivity && (
                <div style={{ color: premiumTheme.accent.gold }}>
                  🐋 Whale Activity Detected
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-3 rounded-lg" style={{ 
          backgroundColor: premiumTheme.background.secondary,
          border: `1px solid ${premiumTheme.borders.subtle}`,
        }}>
          <div className="text-xs mb-1" style={{ color: premiumTheme.accent.platinum + '99' }}>
            Price Levels
          </div>
          <div className="text-lg font-bold" style={{ color: premiumTheme.accent.platinum }}>
            {sortedNodes.length}
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ 
          backgroundColor: premiumTheme.background.secondary,
          border: `1px solid ${premiumTheme.borders.subtle}`,
        }}>
          <div className="text-xs mb-1" style={{ color: premiumTheme.accent.platinum + '99' }}>
            Total Volume
          </div>
          <div className="text-lg font-bold" style={{ color: premiumTheme.trading.buy.base }}>
            ${formatVolume(metrics.totalBuyVolume + metrics.totalSellVolume)}
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ 
          backgroundColor: premiumTheme.background.secondary,
          border: `1px solid ${premiumTheme.borders.subtle}`,
        }}>
          <div className="text-xs mb-1" style={{ color: premiumTheme.accent.platinum + '99' }}>
            Zoom Level
          </div>
          <div className="text-lg font-bold" style={{ color: premiumTheme.accent.gold }}>
            {(zoomLevel * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 text-xs text-center" style={{ color: premiumTheme.accent.platinum + '66' }}>
        Keyboard: <span className="font-mono">+/-</span> Zoom • <span className="font-mono">R</span> Reset
      </div>
    </motion.div>
  );
}

// Helper function
function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toFixed(0);
}
