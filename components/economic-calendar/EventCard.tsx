'use client';

import { useState } from 'react';
import type { EconomicEvent } from '@/lib/economic-calendar/types';
import { 
  getCategoryIcon, 
  getImpactBadge,
  getImpactColor 
} from '@/lib/economic-calendar/events-data';
import { getCountdown, formatEventDate } from '@/lib/economic-calendar/api';

interface EventCardProps {
  event: EconomicEvent;
  onClick: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const icon = getCategoryIcon(event.category);
  const impactBadge = getImpactBadge(event.impact);
  const impactColor = getImpactColor(event.impact);
  const countdown = getCountdown(event.eventDate);
  const formattedDate = formatEventDate(event.eventDate);

  return (
    <div
      onClick={onClick}
      className="bg-gray-900/50 border border-gray-800 rounded-lg p-2 sm:p-3 lg:p-4 hover:border-blue-500/50 cursor-pointer transition-all duration-200 hover:bg-gray-900/70"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 mb-1">
            <span className="truncate">{formattedDate}</span>
            <span>•</span>
            <span className="whitespace-nowrap">{countdown}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg lg:text-xl flex-shrink-0">{icon}</span>
            <h3 className="font-medium text-white text-xs sm:text-sm line-clamp-2">{event.name}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
          <span className="text-base sm:text-lg">{impactBadge}</span>
          <span className={`text-[10px] sm:text-xs font-semibold ${impactColor}`}>
            {event.impact}
          </span>
        </div>
      </div>
    </div>
  );
}
