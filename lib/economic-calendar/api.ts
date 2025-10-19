import type { EconomicEvent, CalendarFilters } from './types';
import { TOP_ECONOMIC_EVENTS } from './events-data';

/**
 * Filter events based on time range and impact
 */
export function filterEvents(
  events: EconomicEvent[],
  filters: CalendarFilters
): EconomicEvent[] {
  let filtered = [...events];

  // Filter by time range
  if (filters.timeRange) {
    const now = new Date();
    const endDate = new Date();

    switch (filters.timeRange) {
      case 'today':
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(
          (event) =>
            event.eventDate >= now &&
            event.eventDate <= endDate
        );
        break;
      case 'week':
        endDate.setDate(endDate.getDate() + 7);
        filtered = filtered.filter(
          (event) =>
            event.eventDate >= now &&
            event.eventDate <= endDate
        );
        break;
      case 'month':
        endDate.setDate(endDate.getDate() + 30);
        filtered = filtered.filter(
          (event) =>
            event.eventDate >= now &&
            event.eventDate <= endDate
        );
        break;
    }
  }

  // Filter by impact
  if (filters.impact) {
    filtered = filtered.filter((event) => event.impact === filters.impact);
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((event) => event.category === filters.category);
  }

  // Sort by date
  filtered.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  return filtered;
}

/**
 * Calculate countdown to event
 */
export function getCountdown(eventDate: Date): string {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  if (diff < 0) {
    return 'Past';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format date for display
 */
export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(date);
}

/**
 * Get sample upcoming events (for MVP without real API integration)
 * In production, this would fetch from Trading Economics API
 */
export function getSampleUpcomingEvents(): EconomicEvent[] {
  const now = new Date();
  const events: EconomicEvent[] = [];

  // Create sample events for next 30 days
  TOP_ECONOMIC_EVENTS.forEach((template, index) => {
    // Create 2-3 instances of each event spread across the month
    const instanceCount = template.frequency?.includes('Weekly') ? 4 : 
                         template.frequency?.includes('Monthly') ? 2 : 1;

    for (let i = 0; i < instanceCount; i++) {
      const daysAhead = Math.floor((index + i * 7 + 2) % 30) + 1;
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + daysAhead);
      
      // Set time based on primary window start
      if (template.primaryWindowStart) {
        const [hours, minutes] = template.primaryWindowStart.split(':').map(Number);
        eventDate.setUTCHours(hours, minutes, 0, 0);
      } else {
        eventDate.setUTCHours(14, 0, 0, 0);
      }

      events.push({
        id: `event-${index}-${i}`,
        name: template.name!,
        country: template.country!,
        category: template.category!,
        impact: template.impact!,
        eventDate,
        source: template.source,
        sourceUrl: template.sourceUrl,
        frequency: template.frequency,
        btcAvgImpact: template.btcAvgImpact,
        ethAvgImpact: template.ethAvgImpact,
        spxAvgImpact: template.spxAvgImpact,
        volumeSpike: template.volumeSpike,
        primaryWindowStart: template.primaryWindowStart,
        primaryWindowEnd: template.primaryWindowEnd,
        extendedWindowStart: template.extendedWindowStart,
        extendedWindowEnd: template.extendedWindowEnd,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return events.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}
