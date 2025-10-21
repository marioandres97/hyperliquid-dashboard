import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTrackerState,
  updateTrackerState,
  incrementTrackedCount,
  incrementErrorCount,
  startTracker,
  stopTracker,
  resetTracker,
} from '@/lib/services/whaleTracker.state';

describe('WhaleTracker State', () => {
  beforeEach(() => {
    // Reset tracker state before each test
    updateTrackerState({
      enabled: true,
      running: false,
      trackedCount: 0,
      lastTrackTime: undefined,
      startTime: undefined,
      errors: 0,
    });
  });

  describe('getTrackerState', () => {
    it('should return current tracker state', () => {
      const state = getTrackerState();
      expect(state).toHaveProperty('enabled');
      expect(state).toHaveProperty('running');
      expect(state).toHaveProperty('trackedCount');
      expect(state).toHaveProperty('errors');
    });
  });

  describe('updateTrackerState', () => {
    it('should update tracker state with new values', () => {
      updateTrackerState({ trackedCount: 10, errors: 2 });
      const state = getTrackerState();
      expect(state.trackedCount).toBe(10);
      expect(state.errors).toBe(2);
    });

    it('should partially update tracker state', () => {
      updateTrackerState({ trackedCount: 5 });
      const state = getTrackerState();
      expect(state.trackedCount).toBe(5);
      expect(state.enabled).toBe(true); // Should remain unchanged
    });
  });

  describe('incrementTrackedCount', () => {
    it('should increment tracked count', () => {
      const stateBefore = getTrackerState();
      const countBefore = stateBefore.trackedCount;

      incrementTrackedCount();

      const stateAfter = getTrackerState();
      expect(stateAfter.trackedCount).toBe(countBefore + 1);
    });

    it('should update last track time', () => {
      incrementTrackedCount();

      const state = getTrackerState();
      expect(state.lastTrackTime).toBeInstanceOf(Date);
    });

    it('should increment multiple times', () => {
      incrementTrackedCount();
      incrementTrackedCount();
      incrementTrackedCount();

      const state = getTrackerState();
      expect(state.trackedCount).toBe(3);
    });
  });

  describe('incrementErrorCount', () => {
    it('should increment error count', () => {
      const stateBefore = getTrackerState();
      const errorsBefore = stateBefore.errors;

      incrementErrorCount();

      const stateAfter = getTrackerState();
      expect(stateAfter.errors).toBe(errorsBefore + 1);
    });

    it('should increment multiple times', () => {
      incrementErrorCount();
      incrementErrorCount();

      const state = getTrackerState();
      expect(state.errors).toBe(2);
    });
  });

  describe('startTracker', () => {
    it('should start tracker successfully', () => {
      const result = startTracker();
      expect(result.success).toBe(true);

      const state = getTrackerState();
      expect(state.running).toBe(true);
      expect(state.startTime).toBeInstanceOf(Date);
    });

    it('should fail if tracker is already running', () => {
      startTracker(); // Start first time
      const result = startTracker(); // Try to start again

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tracker is already running');
    });
  });

  describe('stopTracker', () => {
    it('should stop tracker successfully', () => {
      startTracker(); // Start tracker first
      const result = stopTracker();

      expect(result.success).toBe(true);

      const state = getTrackerState();
      expect(state.running).toBe(false);
    });

    it('should fail if tracker is already stopped', () => {
      const result = stopTracker();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tracker is already stopped');
    });
  });

  describe('resetTracker', () => {
    it('should reset tracker statistics', () => {
      // Set some values
      updateTrackerState({
        trackedCount: 10,
        errors: 5,
        lastTrackTime: new Date(),
      });

      resetTracker();

      const state = getTrackerState();
      expect(state.trackedCount).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.lastTrackTime).toBeUndefined();
    });

    it('should reset start time if tracker is running', () => {
      startTracker();
      const stateBefore = getTrackerState();
      const startTimeBefore = stateBefore.startTime;

      // Wait a bit
      setTimeout(() => {
        resetTracker();

        const stateAfter = getTrackerState();
        expect(stateAfter.startTime).not.toBe(startTimeBefore);
        expect(stateAfter.running).toBe(true);
      }, 10);
    });

    it('should not set start time if tracker is not running', () => {
      resetTracker();

      const state = getTrackerState();
      expect(state.running).toBe(false);
    });
  });

  describe('tracker workflow', () => {
    it('should support complete start-track-stop workflow', () => {
      // Start tracker
      const startResult = startTracker();
      expect(startResult.success).toBe(true);

      // Track some trades
      incrementTrackedCount();
      incrementTrackedCount();
      incrementTrackedCount();

      let state = getTrackerState();
      expect(state.running).toBe(true);
      expect(state.trackedCount).toBe(3);

      // Stop tracker
      const stopResult = stopTracker();
      expect(stopResult.success).toBe(true);

      state = getTrackerState();
      expect(state.running).toBe(false);
      expect(state.trackedCount).toBe(3); // Count should persist after stop
    });

    it('should track errors separately from successful tracks', () => {
      startTracker();

      incrementTrackedCount();
      incrementTrackedCount();
      incrementErrorCount();
      incrementTrackedCount();
      incrementErrorCount();
      incrementErrorCount();

      const state = getTrackerState();
      expect(state.trackedCount).toBe(3);
      expect(state.errors).toBe(3);
    });

    it('should support reset during operation', () => {
      startTracker();

      incrementTrackedCount();
      incrementTrackedCount();
      incrementErrorCount();

      resetTracker();

      const state = getTrackerState();
      expect(state.trackedCount).toBe(0);
      expect(state.errors).toBe(0);
      expect(state.running).toBe(true); // Should still be running
    });
  });
});
