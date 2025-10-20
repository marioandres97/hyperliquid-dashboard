/**
 * Enhanced types for Economic Calendar with filters, notifications, and views
 */

import type { EventImpact } from '@/lib/economic-calendar/types';

export interface EventFilters {
  impacts: EventImpact[];
  countries: string[];
}

export interface NotificationSettings {
  enabled: boolean;
  timings: number[]; // minutes before event [5, 15, 30, 60]
}

export interface SubscribedEvent {
  eventId: string;
  notifiedAt: Record<number, boolean>; // { 15: true, 5: false }
}

export type ViewMode = 'list' | 'calendar';

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
  formatted: string;
  colorClass: string;
}

export interface CalendarDay {
  date: Date;
  events: string[]; // event IDs
  isToday: boolean;
  isCurrentMonth: boolean;
}
