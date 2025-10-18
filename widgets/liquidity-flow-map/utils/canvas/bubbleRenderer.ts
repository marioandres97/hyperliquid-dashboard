/**
 * Canvas-based Trade Bubble Renderer
 * For displaying large trades as animated bubbles on the chart
 */

import { TradeBubble } from '../../types';
import { premiumTheme } from '@/lib/theme/premium-colors';

export interface BubbleConfig {
  width: number;
  height: number;
  priceRange: [number, number];
  timeRange: [number, number];
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Bubble size configuration
const BUBBLE_SIZE_CONFIG = {
  LARGE: { threshold: 500_000, radius: 40 },
  MEDIUM: { threshold: 100_000, radius: 25 },
  SMALL: { threshold: 50_000, radius: 15 },
  TINY: { radius: 10 },
};

// Animation timing configuration
const ANIMATION_TIMING = {
  FADE_IN_MS: 300,
  FADE_OUT_MS: 2000,
  LIFETIME_MS: 15000,
};

// Bubble colors from theme
const BUBBLE_COLORS = {
  BUY: {
    fill: premiumTheme.trading.buy.glow,
    stroke: premiumTheme.trading.buy.base,
  },
  SELL: {
    fill: premiumTheme.trading.sell.glow,
    stroke: premiumTheme.trading.sell.base,
  },
};

/**
 * Calculate bubble radius based on trade notional value
 */
export function calculateBubbleRadius(notional: number): number {
  if (notional >= BUBBLE_SIZE_CONFIG.LARGE.threshold) return BUBBLE_SIZE_CONFIG.LARGE.radius;
  if (notional >= BUBBLE_SIZE_CONFIG.MEDIUM.threshold) return BUBBLE_SIZE_CONFIG.MEDIUM.radius;
  if (notional >= BUBBLE_SIZE_CONFIG.SMALL.threshold) return BUBBLE_SIZE_CONFIG.SMALL.radius;
  return BUBBLE_SIZE_CONFIG.TINY.radius;
}

/**
 * Determine if trade should create a bubble (>$50K)
 */
export function shouldCreateBubble(notional: number): boolean {
  return notional >= BUBBLE_SIZE_CONFIG.SMALL.threshold;
}

/**
 * Create a new trade bubble
 */
export function createTradeBubble(
  price: number,
  size: number,
  notional: number,
  side: 'buy' | 'sell',
  timestamp: number
): TradeBubble {
  const radius = calculateBubbleRadius(notional);
  const now = Date.now();
  
  return {
    id: `bubble-${timestamp}-${Math.random().toString(36).slice(2, 11)}`,
    timestamp,
    price,
    size,
    notional,
    side,
    radius,
    opacity: 0, // Start invisible for fade-in
    createdAt: now,
    expiresAt: now + ANIMATION_TIMING.LIFETIME_MS,
  };
}

/**
 * Bubble Renderer for trade visualizations
 */
export class BubbleRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: BubbleConfig;
  private bubbles: TradeBubble[] = [];
  private animationFrame: number | null = null;

  constructor(ctx: CanvasRenderingContext2D, config: BubbleConfig) {
    this.ctx = ctx;
    this.config = config;
  }

  updateConfig(config: Partial<BubbleConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Add a new bubble
   */
  addBubble(bubble: TradeBubble) {
    this.bubbles.push(bubble);
    // Bubble added - tracking for large trades
  }

  /**
   * Update bubble states (opacity, etc.)
   */
  private updateBubbles() {
    const now = Date.now();
    
    // Update opacity for each bubble
    this.bubbles = this.bubbles.filter(bubble => {
      const age = now - bubble.createdAt;
      const lifetime = bubble.expiresAt - bubble.createdAt;
      
      // Fade in during first phase
      if (age < ANIMATION_TIMING.FADE_IN_MS) {
        bubble.opacity = age / ANIMATION_TIMING.FADE_IN_MS;
      }
      // Stay at full opacity until fade out phase
      else if (age < lifetime - ANIMATION_TIMING.FADE_OUT_MS) {
        bubble.opacity = 1;
      }
      // Fade out during last phase
      else if (age < lifetime) {
        bubble.opacity = (lifetime - age) / ANIMATION_TIMING.FADE_OUT_MS;
      }
      // Remove if expired
      else {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Draw a single bubble
   */
  private drawBubble(bubble: TradeBubble) {
    const { ctx } = this;
    const { height, padding, priceRange, timeRange } = this.config;

    const chartHeight = height - padding.top - padding.bottom;
    const [minPrice, maxPrice] = priceRange;
    const priceScale = chartHeight / (maxPrice - minPrice);

    // Calculate Y position (price on Y-axis)
    const y = height - padding.bottom - (bubble.price - minPrice) * priceScale;

    // Calculate X position (timestamp on X-axis)
    const chartWidth = this.config.width - padding.left - padding.right;
    const [startTime, endTime] = timeRange;
    const timeScale = chartWidth / (endTime - startTime);
    const x = padding.left + (bubble.timestamp - startTime) * timeScale;

    // Skip if outside visible area
    if (x < padding.left || x > this.config.width - padding.right) return;
    if (y < padding.top || y > height - padding.bottom) return;

    const age = Date.now() - bubble.createdAt;
    
    // Calculate pulse effect (subtle scale oscillation)
    const pulseScale = 1 + Math.sin(age / 200) * 0.05;
    const radius = bubble.radius * pulseScale;

    // Determine colors based on side
    const isBuy = bubble.side === 'buy';
    const fillColor = isBuy 
      ? BUBBLE_COLORS.BUY.fill.replace('0.4', `${0.3 * bubble.opacity}`)
      : BUBBLE_COLORS.SELL.fill.replace('0.4', `${0.3 * bubble.opacity}`);
    const strokeColor = isBuy 
      ? BUBBLE_COLORS.BUY.stroke 
      : BUBBLE_COLORS.SELL.stroke;

    // Draw bubble
    ctx.save();
    
    // Semi-transparent fill
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Bright border
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 10 * bubble.opacity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();

    // Draw amount text for larger bubbles
    if (radius >= 20 && bubble.opacity > 0.5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const amountText = bubble.notional >= 1_000_000 
        ? `$${(bubble.notional / 1_000_000).toFixed(1)}M`
        : `$${(bubble.notional / 1_000).toFixed(0)}K`;
      
      ctx.fillText(amountText, x, y);
    }
  }

  /**
   * Draw all active bubbles
   */
  draw() {
    this.updateBubbles();
    this.bubbles.forEach(bubble => this.drawBubble(bubble));
  }

  /**
   * Get active bubble count
   */
  getActiveBubbleCount(): number {
    return this.bubbles.length;
  }

  /**
   * Clear all bubbles
   */
  clearBubbles() {
    this.bubbles = [];
  }

  /**
   * Get bubbles at a specific position (for tooltips)
   */
  getBubblesAtPosition(screenX: number, screenY: number, tolerance: number = 5): TradeBubble[] {
    const { height, padding, priceRange, timeRange, width } = this.config;
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = width - padding.left - padding.right;
    const [minPrice, maxPrice] = priceRange;
    const [startTime, endTime] = timeRange;
    const priceScale = chartHeight / (maxPrice - minPrice);
    const timeScale = chartWidth / (endTime - startTime);

    return this.bubbles.filter(bubble => {
      const y = height - padding.bottom - (bubble.price - minPrice) * priceScale;
      const x = padding.left + (bubble.timestamp - startTime) * timeScale;
      
      const distance = Math.sqrt(
        Math.pow(x - screenX, 2) + Math.pow(y - screenY, 2)
      );
      
      return distance <= (bubble.radius + tolerance);
    });
  }
}
