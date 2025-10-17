'use client';

import React from 'react';
import type { PlaybackState } from '../types';

export interface HistoryPlaybackControlsProps {
  playbackState: PlaybackState | null;
  progress: number;
  isPlaying: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeekTo: (timestamp: number) => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onDirectionChange: (direction: 'forward' | 'backward') => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export function HistoryPlaybackControls({
  playbackState,
  progress,
  isPlaying,
  canPlay,
  onPlay,
  onPause,
  onStop,
  onSeekTo,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onDirectionChange,
}: HistoryPlaybackControlsProps) {
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playbackState) return;
    
    const progressValue = parseFloat(e.target.value);
    const totalDuration = playbackState.endTime - playbackState.startTime;
    const targetTime = playbackState.startTime + (totalDuration * progressValue);
    onSeekTo(targetTime);
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  if (!canPlay) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="text-center text-white/60">
          <p className="text-sm">No historical data available</p>
          <p className="text-xs mt-1">Start collecting data to enable playback</p>
        </div>
      </div>
    );
  }

  const currentSpeed = playbackState?.speed || 1;
  const currentDirection = playbackState?.direction || 'forward';
  const totalDuration = playbackState ? playbackState.endTime - playbackState.startTime : 0;

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      {/* Title */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>⏱️</span>
          <span>Time Machine</span>
        </h3>
        {playbackState && (
          <span className="text-sm text-white/60">
            {formatTime(playbackState.currentTime)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-blue-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-blue-500
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
        />
        {playbackState && (
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(playbackState.startTime)}</span>
            <span>{formatDuration(totalDuration)}</span>
            <span>{formatTime(playbackState.endTime)}</span>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Step Backward */}
        <button
          onClick={onStepBackward}
          disabled={!canPlay}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step Backward"
        >
          <span className="text-white text-lg">⏮️</span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canPlay}
          className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <span className="text-white text-xl">{isPlaying ? '⏸️' : '▶️'}</span>
        </button>

        {/* Stop */}
        <button
          onClick={onStop}
          disabled={!canPlay}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Stop"
        >
          <span className="text-white text-lg">⏹️</span>
        </button>

        {/* Step Forward */}
        <button
          onClick={onStepForward}
          disabled={!canPlay}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step Forward"
        >
          <span className="text-white text-lg">⏭️</span>
        </button>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Speed:</span>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map(speed => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  currentSpeed === speed
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Direction Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Direction:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onDirectionChange('backward')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                currentDirection === 'backward'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              ⏪ Back
            </button>
            <button
              onClick={() => onDirectionChange('forward')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                currentDirection === 'forward'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Forward ⏩
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-xs text-white/60 min-w-[3rem] text-right">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
