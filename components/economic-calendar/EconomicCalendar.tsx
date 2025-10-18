'use client';

import { useState } from 'react';
import { useEconomicCalendar } from '@/lib/hooks/economic-calendar/useEconomicCalendar';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import type { EconomicEvent, EconomicEventWithReleases } from '@/lib/economic-calendar/types';

type TimeRangeFilter = 'today' | 'week' | 'month';

export function EconomicCalendar() {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('week');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEventWithReleases | null>(null);

  const { events, loading, error } = useEconomicCalendar({ timeRange });

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Economic Calendar 📅</h2>
          <p className="text-xs text-gray-400 mt-1">
            High-impact events affecting crypto markets
          </p>
        </div>
      </div>

      {/* Time Range Tabs */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as TimeRangeFilter[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Loading events...</p>
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
            <div className="text-center py-12">
              <p className="text-gray-400">No events found for this time range.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event as EconomicEventWithReleases)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 mt-4">
        <p className="text-xs text-gray-400 text-center">
          📊 Historical data. Not financial advice. Information platform only.
        </p>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
