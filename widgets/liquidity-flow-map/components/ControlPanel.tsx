'use client';

import React from 'react';
import type { Coin, TimeWindow } from '../types';

export interface ControlPanelProps {
  coin: Coin;
  timeWindow: TimeWindow;
  isCollecting: boolean;
  onCoinChange: (coin: Coin) => void;
  onTimeWindowChange: (timeWindow: TimeWindow) => void;
  onRefresh?: () => void;
}

const COINS: Coin[] = ['BTC', 'ETH', 'HYPE'];
const TIME_WINDOWS: TimeWindow[] = ['1m', '5m', '15m', '1h', '4h'];

export function ControlPanel({
  coin,
  timeWindow,
  isCollecting,
  onCoinChange,
  onTimeWindowChange,
  onRefresh,
}: ControlPanelProps) {
  return (
    <div className="glass rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isCollecting ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-white">
            {isCollecting ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Coin Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/80">Coin:</label>
          <div className="flex gap-1">
            {COINS.map((c) => (
              <button
                key={c}
                onClick={() => onCoinChange(c)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  coin === c
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/80">Timeframe:</label>
          <div className="flex gap-1">
            {TIME_WINDOWS.map((tw) => (
              <button
                key={tw}
                onClick={() => onTimeWindowChange(tw)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeWindow === tw
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tw}
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-auto px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all"
            title="Refresh data"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
