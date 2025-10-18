/**
 * Canvas-based Heatmap Renderer for Premium Liquidity Flow Map
 */

import { LiquidityNode } from '../../types';
import { premiumTheme } from '@/lib/theme/premium-colors';

export interface HeatmapConfig {
  width: number;
  height: number;
  priceRange: [number, number];
  maxVolume: number;
  pixelRatio: number;
}

// Rendering constants
const MIN_BAR_WIDTH = 3; // Minimum width for main bars in pixels
const MIN_VOLUME_BAR_WIDTH = 2; // Minimum width for volume bars in pixels
const LOG_SCALE_MULTIPLIER = 9; // Multiplier for logarithmic scaling (controls intensity range)
const MIN_ALPHA = 0.15; // Minimum alpha for visibility
const MAX_ALPHA = 0.8; // Maximum alpha to avoid overwhelming colors

/**
 * Apply logarithmic scaling to make low values more visible
 * Uses log10(1 + value * multiplier) / log10(1 + multiplier)
 */
function logScale(value: number, multiplier: number = LOG_SCALE_MULTIPLIER): number {
  return Math.log10(1 + value * multiplier) / Math.log10(1 + multiplier);
}

export class HeatmapRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: HeatmapConfig;

  constructor(ctx: CanvasRenderingContext2D, config: HeatmapConfig) {
    this.ctx = ctx;
    this.config = config;
  }

  updateConfig(config: Partial<HeatmapConfig>) {
    this.config = { ...this.config, ...config };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  }

  drawBackground() {
    const { ctx } = this;
    const { width, height } = this.config;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, premiumTheme.background.secondary);
    gradient.addColorStop(1, premiumTheme.background.primary);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = premiumTheme.borders.subtle;
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  drawNode(node: LiquidityNode, y: number, rowHeight: number) {
    const { ctx, config } = this;
    const { width, maxVolume } = config;

    // Calculate total volume for intensity
    const totalVolume = node.buyVolume + node.sellVolume;
    const intensity = totalVolume / maxVolume;
    const netFlow = node.netFlow;

    // Determine color based on net flow - Coinglass style with vibrant colors
    let baseColor: string;
    let glowColor: string;
    
    if (netFlow > 0) {
      // Pink for buying pressure
      baseColor = 'rgba(255, 20, 147, 0.8)';
      glowColor = 'rgba(255, 20, 147, 0.6)';
    } else if (netFlow < 0) {
      // Purple for selling pressure
      baseColor = 'rgba(138, 43, 226, 0.6)';
      glowColor = 'rgba(138, 43, 226, 0.4)';
    } else {
      // Blue for neutral
      baseColor = 'rgba(59, 130, 246, 0.7)';
      glowColor = 'rgba(59, 130, 246, 0.5)';
    }

    // Calculate alpha based on intensity with logarithmic scaling
    const logIntensity = logScale(intensity);
    const alpha = Math.min(Math.max(logIntensity * 0.9, 0.2), 0.9);

    // Draw full-width horizontal band (Coinglass style)
    const barWidth = width - 150; // Leave space for price labels on right
    
    // Create gradient for depth effect
    const gradient = ctx.createLinearGradient(0, y, width, y);
    gradient.addColorStop(0, this.adjustAlpha(baseColor, alpha * 0.3));
    gradient.addColorStop(0.5, this.adjustAlpha(baseColor, alpha));
    gradient.addColorStop(1, this.adjustAlpha(baseColor, alpha * 0.5));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, barWidth, rowHeight - 1);

    // Add glow effect for high intensity (Coinglass style)
    if (intensity > 0.5) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = this.adjustAlpha(baseColor, alpha * 0.3);
      ctx.fillRect(0, y, barWidth, rowHeight - 1);
      ctx.shadowBlur = 0;
    }

    // Whale activity indicator
    if (node.whaleActivity) {
      ctx.fillStyle = premiumTheme.accent.gold;
      ctx.beginPath();
      ctx.arc(20, y + rowHeight / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPriceLabel(price: number, y: number, rowHeight: number, isCurrent: boolean = false) {
    const { ctx, config } = this;
    const { width } = config;

    // Draw price label on the RIGHT side (Coinglass style)
    ctx.font = isCurrent ? 'bold 14px monospace' : '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const priceText = `$${price.toFixed(2)}`;
    const labelX = width - 140;
    const labelY = y + rowHeight / 2;

    // Draw background for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(labelX - 5, labelY - 10, 135, 20);

    // Draw price text
    ctx.fillStyle = isCurrent ? premiumTheme.accent.gold : premiumTheme.accent.platinum;
    ctx.fillText(priceText, labelX, labelY);

    // Current price marker
    if (isCurrent) {
      ctx.fillStyle = premiumTheme.accent.gold;
      ctx.beginPath();
      ctx.arc(labelX - 15, labelY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawVolumeBar(buyVolume: number, sellVolume: number, y: number, rowHeight: number) {
    const { ctx, config } = this;
    const { width, maxVolume } = config;

    // Use logarithmic scaling for better visibility of low volumes
    const scaledBuyVolume = buyVolume > 0 ? logScale(buyVolume / maxVolume) : 0;
    const scaledSellVolume = sellVolume > 0 ? logScale(sellVolume / maxVolume) : 0;

    const buyWidth = scaledBuyVolume * 150;
    const sellWidth = scaledSellVolume * 150;

    // Apply minimum bar width for visibility
    const finalBuyWidth = buyVolume > 0 ? Math.max(buyWidth, MIN_VOLUME_BAR_WIDTH) : 0;
    const finalSellWidth = sellVolume > 0 ? Math.max(sellWidth, MIN_VOLUME_BAR_WIDTH) : 0;

    const centerX = width - 300;

    // Buy volume (left)
    if (finalBuyWidth > 0) {
      ctx.fillStyle = this.hexToRGBA(premiumTheme.trading.buy.base, 0.7);
      ctx.fillRect(centerX - finalBuyWidth, y + 4, finalBuyWidth, rowHeight - 8);
    }

    // Sell volume (right)
    if (finalSellWidth > 0) {
      ctx.fillStyle = this.hexToRGBA(premiumTheme.trading.sell.base, 0.7);
      ctx.fillRect(centerX, y + 4, finalSellWidth, rowHeight - 8);
    }
  }

  private hexToRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private adjustAlpha(rgbaString: string, alpha: number): string {
    // Parse rgba string and replace alpha value
    const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    }
    return rgbaString;
  }
}
