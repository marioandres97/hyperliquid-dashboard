/**
 * Animation Engine for Canvas-based Premium Effects
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export class AnimationEngine {
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;

  createTradeParticles(x: number, y: number, isBuy: boolean, size: number) {
    const color = isBuy ? '#10B981' : '#EF4444';
    const count = Math.min(Math.floor(size / 1000), 10);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 1,
        life: 1,
        maxLife: 60,
        size: Math.random() * 3 + 2,
        color,
      });
    }
  }

  update() {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life++;
      return p.life < p.maxLife;
    });
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = this.hexToRGBA(p.color, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  start(callback: () => void) {
    const animate = () => {
      this.update();
      callback();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  clear() {
    this.particles = [];
  }

  private hexToRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
