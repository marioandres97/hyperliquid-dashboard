'use client';

import { motion } from 'framer-motion';
import type { EventImpact } from '@/lib/economic-calendar/types';

interface ImpactFilterChipsProps {
  selectedImpacts: EventImpact[];
  onImpactToggle: (impact: EventImpact) => void;
}

const IMPACT_OPTIONS: { value: EventImpact; label: string; emoji: string }[] = [
  { value: 'HIGH', label: 'High Impact', emoji: '🔴' },
  { value: 'MEDIUM', label: 'Medium Impact', emoji: '🟡' },
  { value: 'LOW', label: 'Low Impact', emoji: '🟢' },
];

export function ImpactFilterChips({
  selectedImpacts,
  onImpactToggle,
}: ImpactFilterChipsProps) {
  const getImpactStyles = (impact: EventImpact, isActive: boolean) => {
    const baseStyles = 'px-4 py-2 rounded-lg border backdrop-blur-xl transition-all duration-300 cursor-pointer';
    
    switch (impact) {
      case 'HIGH':
        return `${baseStyles} ${
          isActive
            ? 'bg-red-500/10 border-red-500/30 text-red-400 ring-2 ring-emerald-500/50'
            : 'bg-red-500/5 border-red-500/20 text-red-500/60 hover:bg-red-500/10'
        }`;
      case 'MEDIUM':
        return `${baseStyles} ${
          isActive
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 ring-2 ring-emerald-500/50'
            : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500/60 hover:bg-yellow-500/10'
        }`;
      case 'LOW':
        return `${baseStyles} ${
          isActive
            ? 'bg-green-500/10 border-green-500/30 text-green-400 ring-2 ring-emerald-500/50'
            : 'bg-green-500/5 border-green-500/20 text-green-500/60 hover:bg-green-500/10'
        }`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {IMPACT_OPTIONS.map((option) => {
        const isActive = selectedImpacts.includes(option.value);
        
        return (
          <motion.button
            key={option.value}
            onClick={() => onImpactToggle(option.value)}
            className={getImpactStyles(option.value, isActive)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
