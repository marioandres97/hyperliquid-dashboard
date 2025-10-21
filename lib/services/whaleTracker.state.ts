/**
 * Tracker state management
 * In production, this should be stored in Redis or a database
 */

import { TRACKER_CONFIG } from '@/config/whale-trades.config';

let trackerState = {
  enabled: TRACKER_CONFIG.enabled,
  running: TRACKER_CONFIG.autoStart,
  trackedCount: 0,
  lastTrackTime: undefined as Date | undefined,
  startTime: TRACKER_CONFIG.autoStart ? new Date() : undefined,
  errors: 0,
};

/**
 * Update tracker state
 */
export function updateTrackerState(updates: Partial<typeof trackerState>) {
  trackerState = { ...trackerState, ...updates };
}

/**
 * Get tracker state
 */
export function getTrackerState() {
  return { ...trackerState };
}

/**
 * Increment tracked count
 */
export function incrementTrackedCount() {
  trackerState.trackedCount++;
  trackerState.lastTrackTime = new Date();
}

/**
 * Increment error count
 */
export function incrementErrorCount() {
  trackerState.errors++;
}

/**
 * Start tracker
 */
export function startTracker() {
  if (trackerState.running) {
    return { success: false, error: 'Tracker is already running' };
  }
  trackerState.running = true;
  trackerState.startTime = new Date();
  return { success: true };
}

/**
 * Stop tracker
 */
export function stopTracker() {
  if (!trackerState.running) {
    return { success: false, error: 'Tracker is already stopped' };
  }
  trackerState.running = false;
  return { success: true };
}

/**
 * Reset tracker stats
 */
export function resetTracker() {
  trackerState.trackedCount = 0;
  trackerState.errors = 0;
  trackerState.lastTrackTime = undefined;
  if (trackerState.running) {
    trackerState.startTime = new Date();
  }
  return { success: true };
}
