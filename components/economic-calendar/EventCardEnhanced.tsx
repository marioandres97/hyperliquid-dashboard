'use client';

import { motion } from 'framer-motion';
import type { EconomicEvent } from '@/lib/economic-calendar/types';
import { PremiumBadge } from '@/components/shared/PremiumBadge';
import { 
  getCategoryIcon, 
  getImpactBadge,
} from '@/lib/economic-calendar/events-data';
import { formatEventDate } from '@/lib/economic-calendar/api';
import { CountdownTimer } from './CountdownTimer';
import { NotificationBell } from './NotificationBell';

interface EventCardEnhancedProps {
  event: EconomicEvent;
  onClick: () => void;
}

export function EventCardEnhanced({ event, onClick }: EventCardEnhancedProps) {
  const icon = getCategoryIcon(event.category);
  const impactBadge = getImpactBadge(event.impact);
  const formattedDate = formatEventDate(event.eventDate);

  // Map impact to PremiumBadge variant
  const impactVariant = event.impact === 'HIGH' ? 'error' : event.impact === 'MEDIUM' ? 'warning' : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl" />
      
      {/* Subtle gradient border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
      <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-900/30" />

      {/* Hover glow effect */}
      <div className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />

      {/* Content */}
      <div className="relative p-4 sm:p-5 lg:p-6 space-y-3">
        {/* Header - Date and Notification Bell */}
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-mono text-gray-400">
            {formattedDate}
          </div>
          <NotificationBell eventId={event.id} />
        </div>

        {/* Main Content - Icon and Event Name */}
        <div
          onClick={onClick}
          className="cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-blue-50 transition-colors">
                {event.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{event.country}</span>
                {event.category && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-500 capitalize">{event.category.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div>
          <CountdownTimer eventDate={event.eventDate} showProgress={true} />
        </div>

        {/* Impact Badge */}
        <div className="flex items-center justify-between">
          <PremiumBadge variant={impactVariant} size="sm">
            <span className="flex items-center gap-1.5">
              <span>{impactBadge}</span>
              <span>{event.impact}</span>
            </span>
          </PremiumBadge>
        </div>
      </div>

      {/* Hover scale effect */}
      <div className="absolute inset-0 group-hover:scale-[1.02] transition-transform duration-300" />
    </motion.div>
  );
}
