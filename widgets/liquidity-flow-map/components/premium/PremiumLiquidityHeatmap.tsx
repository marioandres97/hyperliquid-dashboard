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
        className="premium-glass rounded-xl p-4 md:p-6"
        variants={heatmapVariants}
        initial="hidden"
        animate="show"
      >
        <h3 className="text-lg md:text-xl font-semibold text-white mb-4" style={{ color: premiumTheme.accent.gold }}>
          Mapa de Calor de Liquidez
        </h3>
        <p className="text-white/60 text-center py-12">No hay datos de liquidez disponibles</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="premium-glass rounded-xl p-4 md:p-6"
      variants={heatmapVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold" style={{ color: premiumTheme.accent.gold }}>
            Mapa de Calor de Liquidez
          </h3>
          {currentPrice && (
            <div className="text-xs md:text-sm mt-1" style={{ color: premiumTheme.accent.platinum + '99' }}>
              Precio actual: <span className="font-mono font-bold" style={{ color: premiumTheme.accent.gold }}>
                ${currentPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>

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
            title="Acercar (+)"
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
            title="Alejar (-)"
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
            title="Reiniciar (R)"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: premiumTheme.trading.buy.base }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Compra</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: premiumTheme.trading.sell.base }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Venta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: premiumTheme.accent.gold }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Ballenas</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden" style={{ 
        border: `1px solid ${premiumTheme.borders.medium}`,
        backgroundColor: premiumTheme.background.primary,
        minHeight: '400px',
      }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block', cursor: 'crosshair', width: '100%' }}
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
                Compra: ${formatVolume(hoveredNode.buyVolume)} ({hoveredNode.buyCount})
              </div>
              <div style={{ color: premiumTheme.trading.sell.base }}>
                Venta: ${formatVolume(hoveredNode.sellVolume)} ({hoveredNode.sellCount})
              </div>
              <div style={{ color: premiumTheme.accent.platinum }}>
                Neto: ${formatVolume(hoveredNode.netFlow)}
              </div>
              {hoveredNode.whaleActivity && (
                <div style={{ color: premiumTheme.accent.gold }}>
                  🐋 Actividad Ballena
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 text-xs text-center" style={{ color: premiumTheme.accent.platinum + '66' }}>
        Teclado: <span className="font-mono">+/-</span> Zoom • <span className="font-mono">R</span> Reiniciar
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
