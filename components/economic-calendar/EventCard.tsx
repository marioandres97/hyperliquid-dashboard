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
      className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 cursor-pointer transition-all duration-200 hover:bg-gray-900/70"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{countdown}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-medium text-white text-sm">{event.name}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-lg">{impactBadge}</span>
          <span className={`text-xs font-semibold ${impactColor}`}>
            {event.impact}
          </span>
        </div>
      </div>

      {/* Impact Stats */}
      {event.btcAvgImpact !== undefined && event.volumeSpike !== undefined && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-800/50 rounded px-2 py-1">
            <span className="text-gray-400">Avg Impact:</span>
            <span className="text-white ml-1 font-medium">
              ±{event.btcAvgImpact.toFixed(1)}%
            </span>
          </div>
          <div className="bg-gray-800/50 rounded px-2 py-1">
            <span className="text-gray-400">Volume:</span>
            <span className="text-white ml-1 font-medium">
              +{event.volumeSpike}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
