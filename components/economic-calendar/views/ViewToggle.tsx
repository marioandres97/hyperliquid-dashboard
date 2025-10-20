'use client';

import { motion } from 'framer-motion';
import { Calendar, Rows3 } from 'lucide-react';
import type { ViewMode } from '@/types/economic-calendar';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-gray-900/50 backdrop-blur-xl border border-emerald-500/20">
      <button
        onClick={() => onViewModeChange('list')}
        className={`relative px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
          viewMode === 'list'
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        {viewMode === 'list' && (
          <motion.div
            layoutId="viewToggle"
            className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-md"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Rows3 className="w-4 h-4" />
          List
        </span>
      </button>

      <button
        onClick={() => onViewModeChange('calendar')}
        className={`relative px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
          viewMode === 'calendar'
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        {viewMode === 'calendar' && (
          <motion.div
            layoutId="viewToggle"
            className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-md"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Calendar
        </span>
      </button>
    </div>
  );
}
