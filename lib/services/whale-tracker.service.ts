/**
 * Whale Tracker Service
 * 
 * Server-side whale trade tracking service
 * Monitors trades and stores to PostgreSQL in batches
 * 
 * Note: This is a stub for server-side initialization.
 * Actual WebSocket monitoring will happen client-side or via separate worker process.
 */

import { log } from '@/lib/core/logger';
import { config } from '@/lib/core/config';
import { updateTrackerState, getTrackerState } from '@/lib/services/whaleTracker.state';

class WhaleTrackerService {
  private isRunning = false;
  private monitoredAssets: string[] = [];

  constructor() {
    // Safely access config with fallback
    this.monitoredAssets = config?.whaleTracking?.monitoredAssets || ['BTC', 'ETH'];
  }

  /**
   * Start whale tracking service
   * This initializes the service and marks it as enabled
   * Actual WebSocket monitoring will be handled separately
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      log.warn('Whale tracker service is already running');
      return;
    }

    if (!config.whaleTracking.enabled) {
      log.info('Whale tracking is disabled in configuration');
      return;
    }

    try {
      log.info('Starting whale tracker service (server-side)', {
        assets: this.monitoredAssets,
        batchInterval: config.whaleTracking.batchInterval,
      });

      this.isRunning = true;
      updateTrackerState({ 
        running: true, 
        enabled: true,
        startTime: new Date() 
      });

      log.info('Whale tracker service initialized successfully', {
        monitoredAssets: this.monitoredAssets,
        note: 'WebSocket monitoring will be handled by client or worker process'
      });
    } catch (error) {
      log.error('Failed to start whale tracker service', error);
      this.isRunning = false;
      updateTrackerState({ running: false });
      throw error;
    }
  }

  /**
   * Stop whale tracking service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      log.warn('Whale tracker service is not running');
      return;
    }

    try {
      log.info('Stopping whale tracker service');

      this.isRunning = false;
      updateTrackerState({ running: false });

      log.info('Whale tracker service stopped successfully');
    } catch (error) {
      log.error('Error stopping whale tracker service', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    const state = getTrackerState();
    
    return {
      running: this.isRunning,
      enabled: config.whaleTracking.enabled,
      monitoredAssets: this.monitoredAssets,
      batchInterval: config.whaleTracking.batchInterval,
      trackedCount: state.trackedCount,
      lastTrackTime: state.lastTrackTime,
      startTime: state.startTime,
      errors: state.errors,
    };
  }

  /**
   * Get tracked trades count
   */
  getTrackedCount(): number {
    return getTrackerState().trackedCount;
  }

  /**
   * Check if service is running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
let whaleTrackerServiceInstance: WhaleTrackerService | null = null;

export function getWhaleTrackerService(): WhaleTrackerService {
  if (!whaleTrackerServiceInstance) {
    whaleTrackerServiceInstance = new WhaleTrackerService();
  }
  return whaleTrackerServiceInstance;
}

export const whaleTrackerService = getWhaleTrackerService();
