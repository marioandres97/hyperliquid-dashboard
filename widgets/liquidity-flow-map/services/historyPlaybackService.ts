/**
 * History Playback Service
 * Provides time machine functionality with video-style controls for historical data playback
 */

import type { 
  PlaybackState, 
  HistoricalSnapshot, 
  Coin,
  FlowData,
  DetectedPattern,
  Alert 
} from '../types';

export class HistoryPlaybackService {
  private snapshots: Map<Coin, HistoricalSnapshot[]> = new Map();
  private playbackStates: Map<Coin, PlaybackState> = new Map();
  private playbackTimers: Map<Coin, NodeJS.Timeout> = new Map();
  private listeners: Map<Coin, Set<(snapshot: HistoricalSnapshot) => void>> = new Map();

  /**
   * Add a historical snapshot
   */
  addSnapshot(
    coin: Coin,
    flowData: FlowData,
    patterns: DetectedPattern[],
    alerts: Alert[],
    currentPrice: number
  ): void {
    const snapshot: HistoricalSnapshot = {
      timestamp: Date.now(),
      flowData,
      patterns,
      alerts,
      price: currentPrice,
    };

    if (!this.snapshots.has(coin)) {
      this.snapshots.set(coin, []);
    }

    const coinSnapshots = this.snapshots.get(coin)!;
    coinSnapshots.push(snapshot);

    // Keep only last 1000 snapshots per coin (memory management)
    if (coinSnapshots.length > 1000) {
      coinSnapshots.shift();
    }

    // Sort by timestamp
    coinSnapshots.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get all snapshots for a coin
   */
  getSnapshots(coin: Coin): HistoricalSnapshot[] {
    return this.snapshots.get(coin) || [];
  }

  /**
   * Get snapshot at specific time
   */
  getSnapshotAt(coin: Coin, timestamp: number): HistoricalSnapshot | null {
    const snapshots = this.getSnapshots(coin);
    if (snapshots.length === 0) return null;

    // Find closest snapshot
    let closest = snapshots[0];
    let minDiff = Math.abs(snapshots[0].timestamp - timestamp);

    for (const snapshot of snapshots) {
      const diff = Math.abs(snapshot.timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snapshot;
      }
    }

    return closest;
  }

  /**
   * Initialize playback state
   */
  initializePlayback(coin: Coin): PlaybackState | null {
    const snapshots = this.getSnapshots(coin);
    if (snapshots.length === 0) return null;

    const state: PlaybackState = {
      isPlaying: false,
      currentTime: snapshots[0].timestamp,
      startTime: snapshots[0].timestamp,
      endTime: snapshots[snapshots.length - 1].timestamp,
      speed: 1,
      direction: 'forward',
    };

    this.playbackStates.set(coin, state);
    return state;
  }

  /**
   * Get current playback state
   */
  getPlaybackState(coin: Coin): PlaybackState | null {
    return this.playbackStates.get(coin) || null;
  }

  /**
   * Play from current position
   */
  play(coin: Coin): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    state.isPlaying = true;
    this.startPlaybackLoop(coin);
  }

  /**
   * Pause playback
   */
  pause(coin: Coin): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    state.isPlaying = false;
    this.stopPlaybackLoop(coin);
  }

  /**
   * Stop and reset to start
   */
  stop(coin: Coin): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    state.isPlaying = false;
    state.currentTime = state.startTime;
    this.stopPlaybackLoop(coin);
    this.notifyListeners(coin);
  }

  /**
   * Seek to specific time
   */
  seekTo(coin: Coin, timestamp: number): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    state.currentTime = Math.max(
      state.startTime,
      Math.min(timestamp, state.endTime)
    );
    this.notifyListeners(coin);
  }

  /**
   * Seek by delta (in milliseconds)
   */
  seekBy(coin: Coin, deltaMs: number): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    this.seekTo(coin, state.currentTime + deltaMs);
  }

  /**
   * Set playback speed
   */
  setSpeed(coin: Coin, speed: number): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    state.speed = speed;

    // Restart playback loop if playing
    if (state.isPlaying) {
      this.stopPlaybackLoop(coin);
      this.startPlaybackLoop(coin);
    }
  }

  /**
   * Set playback direction
   */
  setDirection(coin: Coin, direction: 'forward' | 'backward'): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    state.direction = direction;
  }

  /**
   * Step forward by one snapshot
   */
  stepForward(coin: Coin): void {
    const snapshots = this.getSnapshots(coin);
    const state = this.playbackStates.get(coin);
    if (!state || snapshots.length === 0) return;

    const currentIndex = snapshots.findIndex(s => s.timestamp >= state.currentTime);
    if (currentIndex === -1 || currentIndex >= snapshots.length - 1) return;

    state.currentTime = snapshots[currentIndex + 1].timestamp;
    this.notifyListeners(coin);
  }

  /**
   * Step backward by one snapshot
   */
  stepBackward(coin: Coin): void {
    const snapshots = this.getSnapshots(coin);
    const state = this.playbackStates.get(coin);
    if (!state || snapshots.length === 0) return;

    const currentIndex = snapshots.findIndex(s => s.timestamp >= state.currentTime);
    if (currentIndex <= 0) return;

    state.currentTime = snapshots[currentIndex - 1].timestamp;
    this.notifyListeners(coin);
  }

  /**
   * Subscribe to playback updates
   */
  subscribe(coin: Coin, callback: (snapshot: HistoricalSnapshot) => void): () => void {
    if (!this.listeners.has(coin)) {
      this.listeners.set(coin, new Set());
    }

    this.listeners.get(coin)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(coin)?.delete(callback);
    };
  }

  /**
   * Clear all snapshots for a coin
   */
  clearSnapshots(coin: Coin): void {
    this.snapshots.delete(coin);
    this.playbackStates.delete(coin);
    this.stopPlaybackLoop(coin);
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.snapshots.clear();
    this.playbackStates.clear();
    this.playbackTimers.forEach(timer => clearInterval(timer));
    this.playbackTimers.clear();
    this.listeners.clear();
  }

  /**
   * Get playback progress (0-1)
   */
  getProgress(coin: Coin): number {
    const state = this.playbackStates.get(coin);
    if (!state) return 0;

    const totalDuration = state.endTime - state.startTime;
    if (totalDuration === 0) return 0;

    const currentDuration = state.currentTime - state.startTime;
    return currentDuration / totalDuration;
  }

  /**
   * Start playback loop
   */
  private startPlaybackLoop(coin: Coin): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    // Clear existing timer
    this.stopPlaybackLoop(coin);

    // Calculate update interval based on speed
    // Base interval is 100ms, adjusted by speed
    const interval = 100 / state.speed;

    const timer = setInterval(() => {
      const currentState = this.playbackStates.get(coin);
      if (!currentState || !currentState.isPlaying) {
        this.stopPlaybackLoop(coin);
        return;
      }

      // Calculate time step (100ms in real time, scaled by speed)
      const timeStep = 100 * currentState.speed;
      const delta = currentState.direction === 'forward' ? timeStep : -timeStep;

      const newTime = currentState.currentTime + delta;

      // Check boundaries
      if (currentState.direction === 'forward' && newTime >= currentState.endTime) {
        currentState.currentTime = currentState.endTime;
        currentState.isPlaying = false;
        this.stopPlaybackLoop(coin);
      } else if (currentState.direction === 'backward' && newTime <= currentState.startTime) {
        currentState.currentTime = currentState.startTime;
        currentState.isPlaying = false;
        this.stopPlaybackLoop(coin);
      } else {
        currentState.currentTime = newTime;
      }

      this.notifyListeners(coin);
    }, interval);

    this.playbackTimers.set(coin, timer);
  }

  /**
   * Stop playback loop
   */
  private stopPlaybackLoop(coin: Coin): void {
    const timer = this.playbackTimers.get(coin);
    if (timer) {
      clearInterval(timer);
      this.playbackTimers.delete(coin);
    }
  }

  /**
   * Notify all listeners of current snapshot
   */
  private notifyListeners(coin: Coin): void {
    const state = this.playbackStates.get(coin);
    if (!state) return;

    const snapshot = this.getSnapshotAt(coin, state.currentTime);
    if (!snapshot) return;

    const listeners = this.listeners.get(coin);
    if (!listeners) return;

    listeners.forEach(callback => callback(snapshot));
  }
}

// Singleton instance
let instance: HistoryPlaybackService | null = null;

export function getHistoryPlaybackService(): HistoryPlaybackService {
  if (!instance) {
    instance = new HistoryPlaybackService();
  }
  return instance;
}
