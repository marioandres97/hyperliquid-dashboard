import { NextRequest, NextResponse } from 'next/server';
import { getSampleUpcomingEvents, filterEvents } from '@/lib/economic-calendar/api';
import type { CalendarFilters } from '@/lib/economic-calendar/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters: CalendarFilters = {};
    
    const timeRange = searchParams.get('timeRange');
    if (timeRange === 'today' || timeRange === 'week' || timeRange === 'month') {
      filters.timeRange = timeRange;
    }
    
    const impact = searchParams.get('impact');
    if (impact === 'HIGH' || impact === 'MEDIUM' || impact === 'LOW') {
      filters.impact = impact;
    }
    
    const category = searchParams.get('category');
    if (category) {
      filters.category = category as any;
    }

    // Get sample events
    const allEvents = getSampleUpcomingEvents();
    
    // Filter events
    const filteredEvents = filterEvents(allEvents, filters);

    return NextResponse.json({
      success: true,
      data: filteredEvents,
      count: filteredEvents.length,
    });
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch economic calendar',
      },
      { status: 500 }
    );
  }
}
