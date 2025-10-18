/**
 * Canvas-based Chart Renderer for Candlestick Charts
 * Coinglass-style implementation
 */

import { CandleData } from '../../types';
import { premiumTheme } from '@/lib/theme/premium-colors';

export interface ChartConfig {
  width: number;
  height: number;
  priceRange: [number, number];
  timeRange: [number, number];
  pixelRatio: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const DEFAULT_PADDING = {
  top: 20,
  right: 80,
  bottom: 40,
  left: 10,
};

// Candle drawing configuration
const CANDLE_CONFIG = {
  MIN_WIDTH: 3,
  MAX_WIDTH: 15,
  BODY_WIDTH_RATIO: 0.8,
  SPACING_RATIO: 0.8,
  WICK_LINE_WIDTH: 1,
  BODY_LINE_WIDTH: 1.5,
};

/**
 * Chart Renderer for candlestick charts with overlays
 */
export class ChartRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: ChartConfig;

  constructor(ctx: CanvasRenderingContext2D, config: Partial<ChartConfig>) {
    this.ctx = ctx;
    this.config = {
      width: config.width || 1200,
      height: config.height || 700,
      priceRange: config.priceRange || [0, 100],
      timeRange: config.timeRange || [0, Date.now()],
      pixelRatio: config.pixelRatio || 1,
      padding: config.padding || DEFAULT_PADDING,
    };
  }

  updateConfig(config: Partial<ChartConfig>) {
    this.config = { ...this.config, ...config };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * Draw dark background with grid
   */
  drawBackground() {
    const { ctx } = this;
    const { width, height, padding } = this.config;

    // Dark background
    ctx.fillStyle = premiumTheme.background.primary;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    this.drawGrid();
  }

  /**
   * Draw grid lines
   */
  private drawGrid() {
    const { ctx } = this;
    const { width, height, padding, priceRange } = this.config;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical grid lines (time)
    const verticalLines = 8;
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding.left + (chartWidth / verticalLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    // Horizontal grid lines (price)
    const horizontalLines = 10;
    for (let i = 0; i <= horizontalLines; i++) {
      const y = padding.top + (chartHeight / horizontalLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }
  }

  /**
   * Draw a single candlestick
   */
  drawCandlestick(
    candle: CandleData,
    x: number,
    width: number
  ) {
    const { ctx } = this;
    const { height, padding, priceRange } = this.config;

    const chartHeight = height - padding.top - padding.bottom;
    const [minPrice, maxPrice] = priceRange;
    const priceScale = chartHeight / (maxPrice - minPrice);

    // Calculate Y positions (inverted because canvas Y increases downward)
    const openY = height - padding.bottom - (candle.open - minPrice) * priceScale;
    const closeY = height - padding.bottom - (candle.close - minPrice) * priceScale;
    const highY = height - padding.bottom - (candle.high - minPrice) * priceScale;
    const lowY = height - padding.bottom - (candle.low - minPrice) * priceScale;

    // Determine color
    const isBullish = candle.close >= candle.open;
    const color = isBullish 
      ? premiumTheme.trading.buy.base 
      : premiumTheme.trading.sell.base;

    // Draw wick (high-low line)
    ctx.strokeStyle = color;
    ctx.lineWidth = CANDLE_CONFIG.WICK_LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, highY);
    ctx.lineTo(x + width / 2, lowY);
    ctx.stroke();

    // Draw body (open-close rectangle)
    const bodyHeight = Math.abs(closeY - openY);
    const bodyY = Math.min(openY, closeY);
    
    ctx.fillStyle = color;
    ctx.fillRect(x + width * 0.1, bodyY, width * CANDLE_CONFIG.BODY_WIDTH_RATIO, Math.max(bodyHeight, 1));

    // Add border for hollow effect on bullish candles
    if (isBullish) {
      ctx.strokeStyle = color;
      ctx.lineWidth = CANDLE_CONFIG.BODY_LINE_WIDTH;
      ctx.strokeRect(x + width * 0.1, bodyY, width * CANDLE_CONFIG.BODY_WIDTH_RATIO, Math.max(bodyHeight, 1));
      // Fill with dark background
      ctx.fillStyle = premiumTheme.background.primary;
      ctx.fillRect(x + width * 0.1 + 1, bodyY + 1, width * CANDLE_CONFIG.BODY_WIDTH_RATIO - 2, Math.max(bodyHeight - 2, 0));
    }
  }

  /**
   * Draw multiple candles
   */
  drawCandles(candles: CandleData[]) {
    if (candles.length === 0) return;

    const { width, padding, timeRange } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const [startTime, endTime] = timeRange;
    const timeScale = chartWidth / (endTime - startTime);

    // Calculate candle width based on number of candles
    const candleWidth = Math.max(
      CANDLE_CONFIG.MIN_WIDTH, 
      Math.min(CANDLE_CONFIG.MAX_WIDTH, chartWidth / candles.length * CANDLE_CONFIG.SPACING_RATIO)
    );

    candles.forEach((candle) => {
      const x = padding.left + (candle.timestamp - startTime) * timeScale;
      this.drawCandlestick(candle, x, candleWidth);
    });
  }

  /**
   * Draw liquidation heatmap band overlay
   */
  drawLiquidityBand(
    price: number,
    intensity: number,
    side: 'buy' | 'sell' | 'neutral',
    bandHeight: number = 8
  ) {
    const { ctx } = this;
    const { width, height, padding, priceRange } = this.config;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const [minPrice, maxPrice] = priceRange;
    const priceScale = chartHeight / (maxPrice - minPrice);

    // Calculate Y position
    const y = height - padding.bottom - (price - minPrice) * priceScale;

    // Determine color based on side
    let color: string;
    if (side === 'buy') {
      color = `rgba(255, 20, 147, ${0.4 * intensity})`; // Pink
    } else if (side === 'sell') {
      color = `rgba(138, 43, 226, ${0.3 * intensity})`; // Purple
    } else {
      color = `rgba(59, 130, 246, ${0.25 * intensity})`; // Blue
    }

    // Draw semi-transparent band
    ctx.fillStyle = color;
    ctx.fillRect(padding.left, y - bandHeight / 2, chartWidth, bandHeight);
  }

  /**
   * Draw price axis on the right side
   */
  drawPriceAxis(prices: number[], currentPrice?: number) {
    const { ctx } = this;
    const { width, height, padding, priceRange } = this.config;

    const chartHeight = height - padding.top - padding.bottom;
    const [minPrice, maxPrice] = priceRange;
    const priceScale = chartHeight / (maxPrice - minPrice);

    ctx.fillStyle = premiumTheme.accent.platinum;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    prices.forEach((price) => {
      const y = height - padding.bottom - (price - minPrice) * priceScale;
      
      // Draw price label
      const isCurrentPrice = currentPrice && Math.abs(price - currentPrice) < 1;
      if (isCurrentPrice) {
        ctx.fillStyle = premiumTheme.accent.gold;
        ctx.font = 'bold 12px monospace';
      } else {
        ctx.fillStyle = premiumTheme.accent.platinum;
        ctx.font = '11px monospace';
      }
      
      ctx.fillText(`$${price.toFixed(2)}`, width - padding.right + 5, y + 4);
    });

    // Draw current price line
    if (currentPrice) {
      const y = height - padding.bottom - (currentPrice - minPrice) * priceScale;
      ctx.strokeStyle = premiumTheme.accent.gold;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  /**
   * Draw time axis at the bottom
   */
  drawTimeAxis(timestamps: number[]) {
    const { ctx } = this;
    const { width, height, padding, timeRange } = this.config;

    const chartWidth = width - padding.left - padding.right;
    const [startTime, endTime] = timeRange;
    const timeScale = chartWidth / (endTime - startTime);

    ctx.fillStyle = premiumTheme.accent.platinum;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    timestamps.forEach((timestamp) => {
      const x = padding.left + (timestamp - startTime) * timeScale;
      const date = new Date(timestamp);
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      ctx.fillText(timeStr, x, height - padding.bottom + 20);
    });
  }

  /**
   * Convert screen X coordinate to timestamp
   */
  screenToTime(screenX: number): number {
    const { padding, timeRange, width } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const [startTime, endTime] = timeRange;
    const relativeX = screenX - padding.left;
    return startTime + (relativeX / chartWidth) * (endTime - startTime);
  }

  /**
   * Convert screen Y coordinate to price
   */
  screenToPrice(screenY: number): number {
    const { padding, priceRange, height } = this.config;
    const chartHeight = height - padding.top - padding.bottom;
    const [minPrice, maxPrice] = priceRange;
    const relativeY = height - padding.bottom - screenY;
    return minPrice + (relativeY / chartHeight) * (maxPrice - minPrice);
  }

  /**
   * Convert price to screen Y coordinate
   */
  priceToScreen(price: number): number {
    const { padding, priceRange, height } = this.config;
    const chartHeight = height - padding.top - padding.bottom;
    const [minPrice, maxPrice] = priceRange;
    const priceScale = chartHeight / (maxPrice - minPrice);
    return height - padding.bottom - (price - minPrice) * priceScale;
  }

  /**
   * Convert timestamp to screen X coordinate
   */
  timeToScreen(timestamp: number): number {
    const { padding, timeRange, width } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const [startTime, endTime] = timeRange;
    const timeScale = chartWidth / (endTime - startTime);
    return padding.left + (timestamp - startTime) * timeScale;
  }
}
