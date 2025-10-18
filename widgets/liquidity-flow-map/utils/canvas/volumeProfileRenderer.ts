/**
 * Volume Profile Renderer for Canvas
 */

import { premiumTheme } from '@/lib/theme/premium-colors';

export interface VolumeLevel {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
}

export class VolumeProfileRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawProfile(
    levels: VolumeLevel[],
    x: number,
    y: number,
    width: number,
    height: number,
    maxVolume: number
  ) {
    const { ctx } = this;
    const rowHeight = height / levels.length;

    levels.forEach((level, index) => {
      const barY = y + index * rowHeight;
      const barWidth = (level.volume / maxVolume) * width;

      // Buy volume portion
      const buyRatio = level.buyVolume / level.volume;
      const buyWidth = barWidth * buyRatio;

      // Draw buy portion
      ctx.fillStyle = this.hexToRGBA(premiumTheme.trading.buy.base, 0.6);
      ctx.fillRect(x, barY, buyWidth, rowHeight - 1);

      // Draw sell portion
      ctx.fillStyle = this.hexToRGBA(premiumTheme.trading.sell.base, 0.6);
      ctx.fillRect(x + buyWidth, barY, barWidth - buyWidth, rowHeight - 1);
    });

    // Draw POC marker (Point of Control - highest volume level)
    const pocIndex = levels.findIndex(
      (l) => l.volume === Math.max(...levels.map((l) => l.volume))
    );
    if (pocIndex >= 0) {
      const pocY = y + pocIndex * rowHeight + rowHeight / 2;
      ctx.strokeStyle = premiumTheme.accent.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, pocY);
      ctx.lineTo(x + width, pocY);
      ctx.stroke();
    }
  }

  private hexToRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
