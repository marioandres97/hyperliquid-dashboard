'use client';

import { useState, useEffect } from 'react';
import { useEconomicCalendar } from '@/lib/hooks/economic-calendar/useEconomicCalendar';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import type { EconomicEvent, EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { Calendar, BarChart3, Info, ChevronDown } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Economic Calendar</h2>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
              High-impact events affecting crypto markets
            </p>
          </div>
        </div>
      </div>

      {/* Time Range Tabs */}
      <div className="flex gap-1.5 sm:gap-2">
        {(['today', 'week', 'month'] as TimeRangeFilter[]).map((range) => (
          <button
            key={range}
            onClick={() => {
              setTimeRange(range);
              setShowAll(false); // Reset show all when changing time range
            }}
            className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading State - Skeleton */}
      {loading && (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <div className="space-y-3">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <>
          {events.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm text-gray-400">No events found for this time range.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                {displayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event as EconomicEventWithReleases)}
                  />
                ))}
              </div>
              
              {/* Show More button on mobile */}
              {isMobile && events.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {showAll ? (
                    <>
                      <span>Show Less</span>
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    </>
                  ) : (
                    <>
                      <span>Show More ({events.length - 3} more)</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-2 sm:p-3 mt-3 sm:mt-4">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
          <p className="text-[10px] sm:text-xs text-gray-400 text-center">
            Historical data. Not financial advice. Information platform only.
          </p>
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
