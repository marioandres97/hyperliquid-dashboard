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

    const intensity = Math.abs(node.netFlow) / maxVolume;
    const netFlow = node.netFlow;

    // Determine color based on flow
    let baseColor: string;
    let glowColor: string;
    
    if (netFlow > 0) {
      baseColor = premiumTheme.trading.buy.base;
      glowColor = premiumTheme.trading.buy.glow;
    } else if (netFlow < 0) {
      baseColor = premiumTheme.trading.sell.base;
      glowColor = premiumTheme.trading.sell.glow;
    } else {
      baseColor = premiumTheme.trading.neutral.base;
      glowColor = premiumTheme.trading.neutral.glow;
    }

    // Calculate alpha based on intensity
    const alpha = Math.min(intensity * 0.8, 0.8);

    // Draw main bar
    const barWidth = (Math.abs(netFlow) / maxVolume) * (width - 200);
    
    ctx.fillStyle = this.hexToRGBA(baseColor, alpha);
    ctx.fillRect(150, y, barWidth, rowHeight - 2);

    // Draw glow effect for high intensity
    if (intensity > 0.5) {
      ctx.shadowBlur = 20 * intensity;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = this.hexToRGBA(baseColor, alpha * 0.5);
      ctx.fillRect(150, y, barWidth, rowHeight - 2);
      ctx.shadowBlur = 0;
    }

    // Whale activity indicator
    if (node.whaleActivity) {
      ctx.fillStyle = premiumTheme.accent.gold;
      ctx.beginPath();
      ctx.arc(140, y + rowHeight / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPriceLabel(price: number, y: number, rowHeight: number, isCurrent: boolean = false) {
    const { ctx } = this;

    ctx.font = isCurrent ? 'bold 14px monospace' : '12px monospace';
    ctx.fillStyle = isCurrent ? premiumTheme.accent.gold : premiumTheme.accent.platinum;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const priceText = `$${price.toFixed(2)}`;
    ctx.fillText(priceText, 130, y + rowHeight / 2);

    // Current price marker
    if (isCurrent) {
      ctx.fillStyle = premiumTheme.accent.gold;
      ctx.beginPath();
      ctx.arc(135, y + rowHeight / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawVolumeBar(buyVolume: number, sellVolume: number, y: number, rowHeight: number) {
    const { ctx, config } = this;
    const { width, maxVolume } = config;

    const buyWidth = (buyVolume / maxVolume) * 150;
    const sellWidth = (sellVolume / maxVolume) * 150;

    const centerX = width - 300;

    // Buy volume (left)
    ctx.fillStyle = this.hexToRGBA(premiumTheme.trading.buy.base, 0.7);
    ctx.fillRect(centerX - buyWidth, y + 4, buyWidth, rowHeight - 8);

    // Sell volume (right)
    ctx.fillStyle = this.hexToRGBA(premiumTheme.trading.sell.base, 0.7);
    ctx.fillRect(centerX, y + 4, sellWidth, rowHeight - 8);
  }

  private hexToRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
