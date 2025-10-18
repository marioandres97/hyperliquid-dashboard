'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { CandleData, LiquidityNode, ClassifiedTrade } from '../../types';
import { ChartRenderer } from '../../utils/canvas/chartRenderer';
import { BubbleRenderer, createTradeBubble, shouldCreateBubble } from '../../utils/canvas/bubbleRenderer';
import { useCandleData } from '../../hooks/useCandleData';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { premiumTheme } from '@/lib/theme/premium-colors';
import { heatmapVariants } from '@/lib/effects/premium-effects';

export interface TradingChartProps {
  nodes: Map<number, LiquidityNode>;
  currentPrice?: number;
  trades: ClassifiedTrade[];
  coin: string;
  height?: number;
}

const DEFAULT_HEIGHT = 700;
const CANDLE_INTERVAL = 60; // 1-minute candles
const MAX_CANDLES = 100;

export function TradingChart({
  nodes,
  currentPrice,
  trades,
  coin,
  height = DEFAULT_HEIGHT,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRendererRef = useRef<ChartRenderer | null>(null);
  const bubbleRendererRef = useRef<BubbleRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTradeIndexRef = useRef(0);
  
  const [hoveredInfo, setHoveredInfo] = useState<{
    price: number;
    time: number;
    x: number;
    y: number;
  } | null>(null);

  // Use candle data hook
  const { candles, currentCandle, addTrade: addTradeToCandle } = useCandleData({
    coin: coin as any,
    interval: CANDLE_INTERVAL,
    maxCandles: MAX_CANDLES,
  });

  // Canvas setup
  const { canvasRef, ctx, pixelRatio } = useCanvasRenderer({
    width: containerRef.current?.clientWidth || 1200,
    height: height,
  });

  // Calculate price range from candles and nodes
  const getPriceRange = useCallback((): [number, number] => {
    const allCandles = currentCandle ? [...candles, currentCandle] : candles;
    
    if (allCandles.length === 0 && nodes.size === 0) {
      return currentPrice ? [currentPrice * 0.98, currentPrice * 1.02] : [0, 100];
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    // Include candle prices
    allCandles.forEach(candle => {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    });

    // Include node prices
    nodes.forEach(node => {
      minPrice = Math.min(minPrice, node.price);
      maxPrice = Math.max(maxPrice, node.price);
    });

    // Add 2% padding
    const padding = (maxPrice - minPrice) * 0.02;
    return [minPrice - padding, maxPrice + padding];
  }, [candles, currentCandle, nodes, currentPrice]);

  // Calculate time range
  const getTimeRange = useCallback((): [number, number] => {
    const allCandles = currentCandle ? [...candles, currentCandle] : candles;
    
    if (allCandles.length === 0) {
      const now = Date.now();
      return [now - 3600000, now]; // Last hour
    }

    const timestamps = allCandles.map(c => c.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    // Add some padding to show current time
    return [minTime, Math.max(maxTime, Date.now())];
  }, [candles, currentCandle]);

  // Process new trades
  useEffect(() => {
    if (trades.length === 0) return;

    // Process only new trades
    const newTrades = trades.slice(lastTradeIndexRef.current);
    lastTradeIndexRef.current = trades.length;

    newTrades.forEach(trade => {
      // Log every trade as per requirements for debugging/verification
      console.log('Trade:', {
        price: trade.price,
        size: trade.size,
        side: trade.side,
        notional: trade.notional,
        timestamp: new Date(trade.timestamp).toISOString(),
      });

      // Add to candle data
      addTradeToCandle(trade);

      // Create bubble for large trades
      if (shouldCreateBubble(trade.notional)) {
        const bubble = createTradeBubble(
          trade.price,
          trade.size,
          trade.notional,
          trade.side,
          trade.timestamp
        );
        bubbleRendererRef.current?.addBubble(bubble);
      }
    });
  }, [trades, addTradeToCandle]);

  // Initialize renderers
  useEffect(() => {
    if (!ctx || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const priceRange = getPriceRange();
    const timeRange = getTimeRange();

    const padding = {
      top: 20,
      right: 80,
      bottom: 40,
      left: 10,
    };

    chartRendererRef.current = new ChartRenderer(ctx, {
      width,
      height,
      priceRange,
      timeRange,
      pixelRatio,
      padding,
    });

    bubbleRendererRef.current = new BubbleRenderer(ctx, {
      width,
      height,
      priceRange,
      timeRange,
      padding,
    });

    // Renderers initialized and ready for animation
  }, [ctx, height, pixelRatio]);

  // Animation loop for rendering
  useEffect(() => {
    if (!chartRendererRef.current || !bubbleRendererRef.current || !ctx) return;

    const allCandles = currentCandle ? [...candles, currentCandle] : candles;
    const priceRange = getPriceRange();
    const timeRange = getTimeRange();

    // Update renderer configs
    chartRendererRef.current.updateConfig({ priceRange, timeRange });
    bubbleRendererRef.current.updateConfig({ priceRange, timeRange });

    const animate = () => {
      if (!chartRendererRef.current || !bubbleRendererRef.current || !ctx) return;

      // Clear canvas
      chartRendererRef.current.clear();

      // Draw background and grid
      chartRendererRef.current.drawBackground();

      // Draw liquidation heatmap bands
      const sortedNodes = Array.from(nodes.values()).sort((a, b) => b.price - a.price);
      const maxVolume = Math.max(...sortedNodes.map(n => n.buyVolume + n.sellVolume), 1);
      
      sortedNodes.forEach(node => {
        const intensity = (node.buyVolume + node.sellVolume) / maxVolume;
        const side = node.netFlow > 0 ? 'buy' : node.netFlow < 0 ? 'sell' : 'neutral';
        chartRendererRef.current!.drawLiquidityBand(node.price, intensity, side);
      });

      // Draw candlesticks
      if (allCandles.length > 0) {
        chartRendererRef.current.drawCandles(allCandles);
      }

      // Draw trade bubbles
      bubbleRendererRef.current.draw();

      // Draw axes
      const priceLabels = generatePriceLabels(priceRange, 10);
      chartRendererRef.current.drawPriceAxis(priceLabels, currentPrice);

      const timeLabels = generateTimeLabels(timeRange, 8);
      chartRendererRef.current.drawTimeAxis(timeLabels);

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [ctx, candles, currentCandle, nodes, currentPrice, getPriceRange, getTimeRange]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !chartRendererRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const price = chartRendererRef.current.screenToPrice(y);
    const time = chartRendererRef.current.screenToTime(x);

    setHoveredInfo({ price, time, x: e.clientX, y: e.clientY });
  }, [canvasRef]);

  const handleMouseLeave = useCallback(() => {
    setHoveredInfo(null);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="premium-glass rounded-xl p-4 md:p-6"
      variants={heatmapVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold" style={{ color: premiumTheme.accent.gold }}>
            {coin}-USD Candlestick Chart with Liquidation Heatmap
          </h3>
          <div className="text-xs md:text-sm mt-1" style={{ color: premiumTheme.accent.platinum + '99' }}>
            {candles.length} candles • {bubbleRendererRef.current?.getActiveBubbleCount() || 0} active bubbles
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Bullish Candle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Bearish Candle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 0, 0.5)', border: '2px solid #0f0' }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Big Buy (&gt;$50K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 0, 0, 0.5)', border: '2px solid #f00' }}></div>
          <span style={{ color: premiumTheme.accent.platinum }}>Big Sell (&gt;$50K)</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden" style={{ 
        border: `1px solid ${premiumTheme.borders.medium}`,
        backgroundColor: premiumTheme.background.primary,
        minHeight: `${height}px`,
      }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block', cursor: 'crosshair', width: '100%' }}
        />

        {/* Tooltip */}
        {hoveredInfo && (
          <div
            className="absolute z-10 px-4 py-3 rounded-lg text-sm pointer-events-none"
            style={{
              left: hoveredInfo.x + 20,
              top: hoveredInfo.y - 80,
              backgroundColor: premiumTheme.background.glass,
              border: `1px solid ${premiumTheme.borders.strong}`,
              backdropFilter: 'blur(12px)',
              boxShadow: premiumTheme.borders.glow,
            }}
          >
            <div className="font-mono text-xs space-y-1">
              <div style={{ color: premiumTheme.accent.gold }}>
                Price: ${hoveredInfo.price.toFixed(2)}
              </div>
              <div style={{ color: premiumTheme.accent.platinum }}>
                Time: {new Date(hoveredInfo.time).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-center" style={{ color: premiumTheme.accent.platinum + '66' }}>
        Real-time candlestick chart with liquidation heatmap overlay and big trade bubbles
      </div>
    </motion.div>
  );
}

// Helper functions
function generatePriceLabels(priceRange: [number, number], count: number): number[] {
  const [min, max] = priceRange;
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function generateTimeLabels(timeRange: [number, number], count: number): number[] {
  const [start, end] = timeRange;
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + step * i);
}
