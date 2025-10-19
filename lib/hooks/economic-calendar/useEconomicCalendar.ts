'use client';

import { useState, useEffect } from 'react';
import type { EconomicEvent, CalendarFilters } from '@/lib/economic-calendar/types';

interface UseEconomicCalendarResult {
  events: EconomicEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEconomicCalendar(
  filters: CalendarFilters = {}
): UseEconomicCalendarResult {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (filters.timeRange) params.append('timeRange', filters.timeRange);
      if (filters.impact) params.append('impact', filters.impact);
      if (filters.category) params.append('category', filters.category);

      const response = await fetch(`/api/economic-calendar?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch economic calendar');
      }

      const data = await response.json();
      
      if (data.success) {
        // Parse dates
        const parsedEvents = data.data.map((event: any) => ({
          ...event,
          eventDate: new Date(event.eventDate),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
        setEvents(parsedEvents);
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching economic calendar:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.timeRange, filters.impact, filters.category]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}
