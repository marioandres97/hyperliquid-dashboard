/**
 * Countdown timer utilities for economic events
 */

import type { CountdownData } from '@/types/economic-calendar';

/**
 * Calculate countdown data for an event
 */
export function calculateCountdown(eventDate: Date): CountdownData {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();

  // If event has passed
  if (diff < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMinutes: 0,
      formatted: 'Past',
      colorClass: 'text-gray-500',
    };
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  // Determine color based on time remaining
  let colorClass: string;
  if (minutes > 60) {
    colorClass = 'text-emerald-500'; // safe
  } else if (minutes > 15) {
    colorClass = 'text-yellow-500'; // warning
  } else {
    colorClass = 'text-red-500'; // urgent
  }

  // Format the countdown string
  let formatted: string;
  if (days > 0) {
    formatted = `${days}d ${remainingHours}h`;
  } else if (hours > 0) {
    formatted = `${remainingHours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    formatted = `${remainingMinutes}m ${remainingSeconds}s`;
  } else {
    formatted = `${remainingSeconds}s`;
  }

  return {
    days,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
    totalMinutes: minutes,
    formatted,
    colorClass,
  };
}

/**
 * Format event date for display
 * Returns different formats based on how far away the event is
 */
export function formatEventDateTime(eventDate: Date): string {
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  // If tomorrow
  if (daysDiff === 1) {
    return `Tomorrow ${eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
  }

  // If within a week
  if (daysDiff < 7 && daysDiff > 1) {
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  // Otherwise show full date
  return eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Get progress percentage for countdown (0-100)
 * Calculates progress from 24 hours before event to event time
 * Returns 100% if more than 24 hours away, 0% when event time is reached
 */
export function getCountdownProgress(eventDate: Date): number {
  const now = new Date();
  const eventTime = eventDate.getTime();
  const startTime = eventTime - (24 * 60 * 60 * 1000); // 24 hours before
  const nowTime = now.getTime();

  if (nowTime < startTime) return 100;
  if (nowTime >= eventTime) return 0;

  const elapsed = nowTime - startTime;
  const total = eventTime - startTime;
  const progress = 100 - (elapsed / total) * 100;

  return Math.max(0, Math.min(100, progress));
}
