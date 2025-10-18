'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { premiumTheme } from '@/lib/theme/premium-colors';

export interface PremiumControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onFullscreen?: () => void;
}

export function PremiumControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
}: PremiumControlsProps) {
  const buttonStyle = {
    backgroundColor: premiumTheme.background.tertiary,
    color: premiumTheme.accent.platinum,
    border: `1px solid ${premiumTheme.borders.medium}`,
  };

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {onZoomIn && (
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg hover:scale-110 transition-all"
          style={buttonStyle}
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      )}

      {onZoomOut && (
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg hover:scale-110 transition-all"
          style={buttonStyle}
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="p-2 rounded-lg hover:scale-110 transition-all"
          style={buttonStyle}
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className="p-2 rounded-lg hover:scale-110 transition-all"
          style={buttonStyle}
          title="Fullscreen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
