'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getHistoryPlaybackService } from '../services/historyPlaybackService';
import type { 
  Coin, 
  PlaybackState, 
  HistoricalSnapshot,
  FlowData,
  DetectedPattern,
  Alert,
} from '../types';

export interface UseHistoryPlaybackOptions {
  coin: Coin;
  autoRecord?: boolean; // Automatically record snapshots
  recordInterval?: number; // ms between snapshots
}

export interface UseHistoryPlaybackResult {
  // Playback state
  playbackState: PlaybackState | null;
  currentSnapshot: HistoricalSnapshot | null;
  snapshots: HistoricalSnapshot[];
  
  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  seekTo: (timestamp: number) => void;
  seekBy: (deltaMs: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: 'forward' | 'backward') => void;
  
  // Recording
  addSnapshot: (flowData: FlowData, patterns: DetectedPattern[], alerts: Alert[], price: number) => void;
  clearSnapshots: () => void;
  
  // State
  isPlaying: boolean;
  progress: number; // 0-1
  canPlay: boolean;
}

export function useHistoryPlayback(options: UseHistoryPlaybackOptions): UseHistoryPlaybackResult {
  const { coin, autoRecord = false, recordInterval = 5000 } = options;
  
  const service = useRef(getHistoryPlaybackService());
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<HistoricalSnapshot | null>(null);
  const [snapshots, setSnapshots] = useState<HistoricalSnapshot[]>([]);
  const [progress, setProgress] = useState(0);

  // Initialize playback state
  useEffect(() => {
    const currentSnapshots = service.current.getSnapshots(coin);
    setSnapshots(currentSnapshots);
    
    if (currentSnapshots.length > 0) {
      const state = service.current.initializePlayback(coin);
      setPlaybackState(state);
    }
  }, [coin]);

  // Subscribe to playback updates
  useEffect(() => {
    const unsubscribe = service.current.subscribe(coin, (snapshot) => {
      setCurrentSnapshot(snapshot);
      const state = service.current.getPlaybackState(coin);
      setPlaybackState(state ? { ...state } : null);
      const prog = service.current.getProgress(coin);
      setProgress(prog);
    });

    return unsubscribe;
  }, [coin]);

  // Auto-record snapshots
  useEffect(() => {
    if (!autoRecord) return;

    // This would be implemented by the parent component
    // calling addSnapshot at regular intervals
    
    return () => {};
  }, [autoRecord, recordInterval]);

  // Playback controls
  const play = useCallback(() => {
    service.current.play(coin);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
  }, [coin]);

  const pause = useCallback(() => {
    service.current.pause(coin);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
  }, [coin]);

  const stop = useCallback(() => {
    service.current.stop(coin);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
    setProgress(0);
  }, [coin]);

  const seekTo = useCallback((timestamp: number) => {
    service.current.seekTo(coin, timestamp);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
    const prog = service.current.getProgress(coin);
    setProgress(prog);
  }, [coin]);

  const seekBy = useCallback((deltaMs: number) => {
    service.current.seekBy(coin, deltaMs);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
    const prog = service.current.getProgress(coin);
    setProgress(prog);
  }, [coin]);

  const stepForward = useCallback(() => {
    service.current.stepForward(coin);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
    const prog = service.current.getProgress(coin);
    setProgress(prog);
  }, [coin]);

  const stepBackward = useCallback(() => {
    service.current.stepBackward(coin);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
    const prog = service.current.getProgress(coin);
    setProgress(prog);
  }, [coin]);

  const setSpeed = useCallback((speed: number) => {
    service.current.setSpeed(coin, speed);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
  }, [coin]);

  const setDirection = useCallback((direction: 'forward' | 'backward') => {
    service.current.setDirection(coin, direction);
    const state = service.current.getPlaybackState(coin);
    setPlaybackState(state ? { ...state } : null);
  }, [coin]);

  // Recording controls
  const addSnapshot = useCallback((
    flowData: FlowData,
    patterns: DetectedPattern[],
    alerts: Alert[],
    price: number
  ) => {
    service.current.addSnapshot(coin, flowData, patterns, alerts, price);
    const currentSnapshots = service.current.getSnapshots(coin);
    setSnapshots(currentSnapshots);
    
    // Initialize playback if first snapshot
    if (currentSnapshots.length === 1) {
      const state = service.current.initializePlayback(coin);
      setPlaybackState(state);
    }
  }, [coin]);

  const clearSnapshots = useCallback(() => {
    service.current.clearSnapshots(coin);
    setSnapshots([]);
    setPlaybackState(null);
    setCurrentSnapshot(null);
    setProgress(0);
  }, [coin]);

  return {
    playbackState,
    currentSnapshot,
    snapshots,
    play,
    pause,
    stop,
    seekTo,
    seekBy,
    stepForward,
    stepBackward,
    setSpeed,
    setDirection,
    addSnapshot,
    clearSnapshots,
    isPlaying: playbackState?.isPlaying || false,
    progress,
    canPlay: snapshots.length > 0,
  };
}
