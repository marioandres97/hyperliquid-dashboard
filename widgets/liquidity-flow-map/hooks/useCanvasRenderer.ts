/**
 * Hook for managing Canvas rendering with high DPI support
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseCanvasRendererProps {
  width: number;
  height: number;
  onRender?: (ctx: CanvasRenderingContext2D) => void;
}

export function useCanvasRenderer({ width, height, onRender }: UseCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Get pixel ratio for high DPI displays
  const getPixelRatio = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  }, []);

  // Initialize canvas with proper DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelRatio = getPixelRatio();

    // Set display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Set actual size in memory (scaled for DPI)
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    // Scale context to counter DPI scaling
    ctx.scale(pixelRatio, pixelRatio);

    ctxRef.current = ctx;
  }, [width, height, getPixelRatio]);

  // Render callback
  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !onRender) return;

    ctx.clearRect(0, 0, width, height);
    onRender(ctx);
  }, [width, height, onRender]);

  return {
    canvasRef,
    ctx: ctxRef.current,
    render,
    pixelRatio: getPixelRatio(),
  };
}
