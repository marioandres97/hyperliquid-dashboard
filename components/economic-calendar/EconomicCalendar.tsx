'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEconomicCalendar } from '@/lib/hooks/economic-calendar/useEconomicCalendar';
import { EventModal } from './EventModal';
import type { EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { Calendar, BarChart3, Settings, Bell } from 'lucide-react';
import { FilterBar } from './filters/FilterBar';
import { ViewToggle } from './views/ViewToggle';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { NotificationSettings } from './NotificationSettings';
import { applyFilters } from '@/lib/economic-calendar/filters';
import { checkAndNotify, getSubscribedEventIds, cleanupNotifiedStatus } from '@/lib/economic-calendar/notifications';
import type { EventFilters, ViewMode } from '@/types/economic-calendar';

type TimeRangeFilter = 'today' | 'week' | 'month';

export function EconomicCalendar() {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('week');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEventWithReleases | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    impacts: [],
    countries: [],
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [subscribedCount, setSubscribedCount] = useState(0);

  const { events, loading, error } = useEconomicCalendar({ timeRange });

  // Apply filters to events
  const filteredEvents = applyFilters(events, filters);

  // Update subscribed count
  useEffect(() => {
    setSubscribedCount(getSubscribedEventIds().length);
  }, [events]);

  // Check for notifications every minute
  useEffect(() => {
    // Initial check
    checkAndNotify(events);

    // Set up interval (clear any existing interval first)
    const intervalId = setInterval(() => {
      checkAndNotify(events);
    }, 60000); // Check every minute

    // Cleanup: clear interval on unmount or when events change
    return () => clearInterval(intervalId);
  }, [events]);

  // Cleanup notified status for events that have passed
  useEffect(() => {
    const activeEventIds = events.map((e) => e.id);
    cleanupNotifiedStatus(activeEventIds);
  }, [events]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
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

        {/* Notification Settings Button */}
        <button
          onClick={() => setShowNotificationSettings(true)}
          className="relative p-2.5 rounded-xl bg-gray-900/50 backdrop-blur-xl border border-emerald-500/20 hover:bg-gray-900/70 transition-all"
          title="Notification Settings"
        >
          <Settings className="w-5 h-5 text-gray-400" />
          {subscribedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {subscribedCount}
            </span>
          )}
        </button>
      </div>

      {/* Time Range Tabs - Premium Design */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as TimeRangeFilter[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
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

      {/* Filters */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        
        {/* Event count */}
        <div className="text-sm text-gray-400">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
        </div>
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

      {/* Events View */}
      {!loading && !error && (
        <>
          {viewMode === 'list' ? (
            <ListView 
              events={filteredEvents} 
              onEventClick={setSelectedEvent}
            />
          ) : (
            <CalendarView 
              events={filteredEvents} 
              onEventClick={setSelectedEvent}
            />
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

      {/* Notification Settings Panel */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </div>
  );
}
