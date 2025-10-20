'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SIZE_PRESETS } from '@/types/large-orders';

interface SizeRangeSliderProps {
  minSize: number;
  maxSize: number;
  onRangeChange: (min: number, max: number) => void;
}

const PRESET_BUTTONS = [
  { label: 'All', preset: 'ALL' as const },
  { label: '>$100K', preset: 'LARGE' as const },
  { label: '>$500K', preset: 'VERY_LARGE' as const },
  { label: '>$1M', preset: 'MEGA' as const },
  { label: 'Whales Only', preset: 'WHALES_ONLY' as const, highlight: true },
];

const MIN_VALUE = 10000; // $10K
const MAX_VALUE = 10000000; // $10M

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

// Convert linear value to logarithmic scale
function toLog(value: number): number {
  const minLog = Math.log10(MIN_VALUE);
  const maxLog = Math.log10(MAX_VALUE);
  return ((Math.log10(value) - minLog) / (maxLog - minLog)) * 100;
}

// Convert logarithmic scale back to linear value
function fromLog(percent: number): number {
  const minLog = Math.log10(MIN_VALUE);
  const maxLog = Math.log10(MAX_VALUE);
  return Math.pow(10, minLog + (percent / 100) * (maxLog - minLog));
}

export function SizeRangeSlider({ minSize, maxSize, onRangeChange }: SizeRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const minPercent = toLog(minSize);
  const maxPercent = toLog(maxSize);

  const handlePreset = useCallback((preset: keyof typeof SIZE_PRESETS) => {
    const { min, max } = SIZE_PRESETS[preset];
    onRangeChange(min, max);
  }, [onRangeChange]);

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value);
    const newMin = Math.round(fromLog(newPercent));
    if (newMin < maxSize) {
      onRangeChange(newMin, maxSize);
    }
  }, [maxSize, onRangeChange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value);
    const newMax = Math.round(fromLog(newPercent));
    if (newMax > minSize) {
      onRangeChange(minSize, newMax);
    }
  }, [minSize, onRangeChange]);

  return (
    <div className="space-y-4">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESET_BUTTONS.map((button) => (
          <motion.button
            key={button.label}
            onClick={() => handlePreset(button.preset)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-semibold
              transition-all duration-200
              backdrop-blur-xl border
              ${button.highlight
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30'
                : 'bg-gray-900/30 border-white/10 text-gray-400 hover:bg-gray-900/40 hover:border-white/20'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {button.label}
          </motion.button>
        ))}
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Labels */}
        <div className="flex justify-between mb-2 text-xs text-gray-400 font-mono">
          <span>{formatValue(minSize)}</span>
          <span>{formatValue(maxSize)}</span>
        </div>

        {/* Slider Container */}
        <div className="relative h-12 backdrop-blur-xl bg-gray-900/30 border border-white/10 rounded-xl p-2">
          {/* Track Background */}
          <div className="absolute top-1/2 left-2 right-2 h-2 -translate-y-1/2 bg-gray-800/50 rounded-full" />
          
          {/* Active Track */}
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          {/* Min Handle */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={minPercent}
            onChange={handleMinChange}
            onMouseDown={() => setIsDragging('min')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('min')}
            onTouchEnd={() => setIsDragging(null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Max Handle */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={maxPercent}
            onChange={handleMaxChange}
            onMouseDown={() => setIsDragging('max')}
            onMouseUp={() => setIsDragging(null)}
            onTouchStart={() => setIsDragging('max')}
            onTouchEnd={() => setIsDragging(null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Min Handle Visual */}
          <motion.div
            className={`absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-emerald-500 border-2 border-white shadow-lg ${
              isDragging === 'min' ? 'scale-125' : ''
            } transition-transform z-30`}
            style={{ left: `${minPercent}%`, pointerEvents: 'none' }}
            animate={isDragging === 'min' ? { scale: 1.25 } : { scale: 1 }}
          />

          {/* Max Handle Visual */}
          <motion.div
            className={`absolute top-1/2 w-4 h-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500 border-2 border-white shadow-lg ${
              isDragging === 'max' ? 'scale-125' : ''
            } transition-transform z-30`}
            style={{ left: `${maxPercent}%`, pointerEvents: 'none' }}
            animate={isDragging === 'max' ? { scale: 1.25 } : { scale: 1 }}
          />
        </div>

        {/* Scale Markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
          <span>$10K</span>
          <span>$100K</span>
          <span>$500K</span>
          <span>$1M</span>
          <span>$5M</span>
          <span>$10M</span>
        </div>
      </div>
    </div>
  );
}
