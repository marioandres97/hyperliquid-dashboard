/**
 * Browser notification system for economic events
 */

import type { EconomicEvent } from './types';
import type { NotificationSettings, SubscribedEvent } from '@/types/economic-calendar';

const STORAGE_KEY_SUBSCRIPTIONS = 'economic-calendar-subscriptions';
const STORAGE_KEY_SETTINGS = 'economic-calendar-notification-settings';
const STORAGE_KEY_NOTIFIED = 'economic-calendar-notified';

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return { enabled: false, timings: [5, 15, 30] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading notification settings:', error);
  }

  return { enabled: false, timings: [5, 15, 30] };
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

/**
 * Get subscribed event IDs from localStorage
 */
export function getSubscribedEventIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading subscriptions:', error);
  }

  return [];
}

/**
 * Save subscribed event IDs to localStorage
 */
export function saveSubscribedEventIds(eventIds: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(eventIds));
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
}

/**
 * Subscribe to an event
 */
export function subscribeToEvent(eventId: string): void {
  const subscribed = getSubscribedEventIds();
  if (!subscribed.includes(eventId)) {
    saveSubscribedEventIds([...subscribed, eventId]);
  }
}

/**
 * Unsubscribe from an event
 */
export function unsubscribeFromEvent(eventId: string): void {
  const subscribed = getSubscribedEventIds();
  saveSubscribedEventIds(subscribed.filter((id) => id !== eventId));
  
  // Clear notified status for this event
  clearNotifiedStatus(eventId);
}

/**
 * Check if subscribed to an event
 */
export function isSubscribedToEvent(eventId: string): boolean {
  const subscribed = getSubscribedEventIds();
  return subscribed.includes(eventId);
}

/**
 * Get notified status (which timings have been notified)
 */
function getNotifiedStatus(): Record<string, Record<number, boolean>> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY_NOTIFIED);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading notified status:', error);
  }

  return {};
}

/**
 * Save notified status
 */
function saveNotifiedStatus(status: Record<string, Record<number, boolean>>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_NOTIFIED, JSON.stringify(status));
  } catch (error) {
    console.error('Error saving notified status:', error);
  }
}

/**
 * Mark event as notified for a specific timing
 */
export function markAsNotified(eventId: string, minutesBefore: number): void {
  const status = getNotifiedStatus();
  if (!status[eventId]) {
    status[eventId] = {};
  }
  status[eventId][minutesBefore] = true;
  saveNotifiedStatus(status);
}

/**
 * Check if already notified for a specific timing
 */
export function wasNotified(eventId: string, minutesBefore: number): boolean {
  const status = getNotifiedStatus();
  return status[eventId]?.[minutesBefore] === true;
}

/**
 * Clear notified status for an event
 */
function clearNotifiedStatus(eventId: string): void {
  const status = getNotifiedStatus();
  delete status[eventId];
  saveNotifiedStatus(status);
}

/**
 * Send a notification for an event
 */
export function sendEventNotification(
  event: EconomicEvent,
  minutesBefore: number
): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const impactEmoji = event.impact === 'HIGH' ? '🔴' : event.impact === 'MEDIUM' ? '🟡' : '🟢';
  
  try {
    new Notification(`${impactEmoji} ${event.name} in ${minutesBefore}min`, {
      body: `Impact: ${event.impact} • ${event.country}`,
      icon: '/icon-512.png',
      tag: `${event.id}-${minutesBefore}`,
      requireInteraction: minutesBefore <= 5, // stay on screen if urgent
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Send a test notification
 */
export function sendTestNotification(): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification('📅 Economic Calendar Test', {
      body: 'Notifications are working! You will be notified before your subscribed events.',
      icon: '/icon-512.png',
      tag: 'test',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

/**
 * Check events and send notifications (called periodically)
 */
export function checkAndNotify(events: EconomicEvent[]): void {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;
  if (Notification.permission !== 'granted') return;

  const subscribedIds = getSubscribedEventIds();
  const now = new Date();

  events.forEach((event) => {
    // Only check subscribed events
    if (!subscribedIds.includes(event.id)) return;

    const minutesUntil = Math.floor(
      (event.eventDate.getTime() - now.getTime()) / (60 * 1000)
    );

    // Check each configured timing
    settings.timings.forEach((timing) => {
      // If we're at the right time and haven't notified yet
      if (minutesUntil === timing && !wasNotified(event.id, timing)) {
        sendEventNotification(event, timing);
        markAsNotified(event.id, timing);
      }
    });
  });
}

/**
 * Clean up old notified status (events that have passed)
 */
export function cleanupNotifiedStatus(activeEventIds: string[]): void {
  const status = getNotifiedStatus();
  const cleaned: Record<string, Record<number, boolean>> = {};

  Object.keys(status).forEach((eventId) => {
    if (activeEventIds.includes(eventId)) {
      cleaned[eventId] = status[eventId];
    }
  });

  saveNotifiedStatus(cleaned);
}
