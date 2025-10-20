'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEconomicCalendar } from '@/lib/hooks/economic-calendar/useEconomicCalendar';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { PremiumButton } from '@/components/shared/PremiumButton';
import type { EconomicEvent, EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { Calendar, BarChart3, ChevronDown, CalendarX } from 'lucide-react';

type TimeRangeFilter = 'today' | 'week' | 'month';

export function EconomicCalendar() {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('week');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEventWithReleases | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { events, loading, error } = useEconomicCalendar({ timeRange });

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, show only 3 events by default
  const displayEvents = isMobile && !showAll ? events.slice(0, 3) : events;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm">
          <Calendar className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Economic Calendar</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            High-impact events affecting crypto markets
          </p>
        </div>
      </div>

      {/* Time Range Tabs - Premium Design */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as TimeRangeFilter[]).map((range) => (
          <button
            key={range}
            onClick={() => {
              setTimeRange(range);
              setShowAll(false);
            }}
            className={`
              flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-sm font-semibold
              transition-all duration-200 backdrop-blur-sm
              ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }
            `}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State - Premium Skeleton */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-xl overflow-hidden h-32"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl" />
              <div className="relative p-6 space-y-3">
                <div className="h-4 bg-white/10 rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-white/5 rounded-lg w-full animate-pulse" />
                <div className="h-3 bg-white/5 rounded-lg w-2/3 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-red-500/10 backdrop-blur-xl" />
          <div className="relative p-4 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Events Grid - Premium Layout */}
      {!loading && !error && (
        <>
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl mb-4">
                <CalendarX className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-base font-medium text-gray-400">No upcoming events</p>
              <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {displayEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <EventCard
                      event={event}
                      onClick={() => setSelectedEvent(event as EconomicEventWithReleases)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Show More button on mobile - Premium */}
              {isMobile && events.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
                >
                  <span>{showAll ? 'Show Less' : `Show More (${events.length - 3} more)`}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* Disclaimer - Premium */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gray-800/20 backdrop-blur-xl" />
        <div className="relative p-3 border border-gray-700/30 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <p className="text-xs text-gray-400 text-center">
              Historical data. Not financial advice. Information platform only.
            </p>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
