'use client';

import { useState, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ChartFullscreenProps {
  coin: string;
  children: React.ReactNode;
}

export default function ChartFullscreen({ coin, children }: ChartFullscreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      // Disable body scroll when fullscreen is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen]);

  const fullscreenContent = isFullscreen && mounted ? (
    createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
        {/* Close button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close fullscreen"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Coin title */}
        <div className="absolute top-4 left-4 z-50">
          <h2 className="text-2xl font-bold text-white">{coin}</h2>
        </div>

        {/* Chart content */}
        <div className="w-full h-full p-4 md:p-8 pt-16 md:pt-20 flex flex-col">
          <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6 overflow-auto">
            {children}
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      {/* Fullscreen button */}
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="View fullscreen"
      >
        <Maximize2 className="w-4 h-4 text-white" />
      </button>

      {/* Fullscreen overlay */}
      {fullscreenContent}
    </>
  );
}
