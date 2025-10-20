'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EconomicEvent, EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { getImpactColor } from '@/lib/economic-calendar/events-data';

interface CalendarViewProps {
  events: EconomicEvent[];
  onEventClick: (event: EconomicEventWithReleases) => void;
}

export function CalendarView({ events, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = firstDayOfMonth.getDay();
  
  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }

  // Get events for a specific day
  const getEventsForDay = (date: Date | null): EconomicEvent[] => {
    if (!date) return [];
    
    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDay(date);
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-4">
        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-500 uppercase py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const hasEvents = dayEvents.length > 0;
            const today = isToday(date);
            
            return (
              <motion.button
                key={index}
                onClick={() => handleDayClick(date)}
                disabled={!date}
                whileHover={date ? { scale: 1.05 } : undefined}
                whileTap={date ? { scale: 0.95 } : undefined}
                className={`
                  aspect-square border rounded-lg p-2 transition-all relative
                  ${date ? 'cursor-pointer' : 'cursor-default'}
                  ${today ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-800'}
                  ${hasEvents && !today ? 'hover:bg-emerald-500/5' : 'hover:bg-gray-800/50'}
                  ${!date ? 'bg-transparent border-transparent' : 'bg-gray-900/30'}
                `}
              >
                {date && (
                  <>
                    <span className={`text-sm font-semibold ${today ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {date.getDate()}
                    </span>
                    
                    {/* Event dots */}
                    {hasEvents && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              event.impact === 'HIGH'
                                ? 'bg-red-500'
                                : event.impact === 'MEDIUM'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            title={event.name}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      <AnimatePresence mode="wait">
        {selectedDay && selectedDayEvents.length > 0 && (
          <motion.div
            key={selectedDay.toISOString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Events on {selectedDay.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedDayEvents.map((event, index) => (
                <motion.button
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onEventClick(event as EconomicEventWithReleases)}
                  className="w-full text-left p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-emerald-500/30 hover:bg-gray-900/70 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{event.eventDate.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false,
                        })}</span>
                        <span>•</span>
                        <span>{event.country}</span>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        event.impact === 'HIGH'
                          ? 'bg-red-500/10 text-red-400'
                          : event.impact === 'MEDIUM'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-green-500/10 text-green-400'
                      }`}
                    >
                      {event.impact}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
