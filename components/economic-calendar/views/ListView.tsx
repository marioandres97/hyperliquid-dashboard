'use client';

import { motion } from 'framer-motion';
import { CalendarX, ChevronDown } from 'lucide-react';
import type { EconomicEvent, EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { EventCardEnhanced } from '../EventCardEnhanced';
import { useState, useEffect } from 'react';

interface ListViewProps {
  events: EconomicEvent[];
  onEventClick: (event: EconomicEventWithReleases) => void;
}

export function ListView({ events, onEventClick }: ListViewProps) {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Group events by day
  const eventsByDay = events.reduce((acc, event) => {
    const dateKey = event.eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  // On mobile, show only first 3 events by default
  const displayEvents = isMobile && !showAll ? events.slice(0, 3) : events;
  
  const displayEventsByDay = displayEvents.reduce((acc, event) => {
    const dateKey = event.eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl mb-4">
          <CalendarX className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-base font-medium text-gray-400">No upcoming events</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(displayEventsByDay).map(([dateKey, dayEvents], dayIndex) => (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Day Header */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
              {dateKey}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          </div>

          {/* Events Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {dayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dayIndex * 0.1 + index * 0.05 }}
              >
                <EventCardEnhanced
                  event={event}
                  onClick={() => onEventClick(event as EconomicEventWithReleases)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Show More button on mobile */}
      {isMobile && events.length > 3 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
        >
          <span>{showAll ? 'Show Less' : `Show More (${events.length - 3} more)`}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </motion.button>
      )}
    </div>
  );
}
