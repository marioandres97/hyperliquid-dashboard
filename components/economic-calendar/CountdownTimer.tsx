'use client';

import { useState, useEffect } from 'react';
import { calculateCountdown, getCountdownProgress } from '@/lib/economic-calendar/countdown';
import type { CountdownData } from '@/types/economic-calendar';

interface CountdownTimerProps {
  eventDate: Date;
  showProgress?: boolean;
}

export function CountdownTimer({ eventDate, showProgress = true }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownData>(() =>
    calculateCountdown(eventDate)
  );
  const [progress, setProgress] = useState<number>(() =>
    getCountdownProgress(eventDate)
  );

  useEffect(() => {
    // Update countdown every second
    const intervalId = setInterval(() => {
      setCountdown(calculateCountdown(eventDate));
      setProgress(getCountdownProgress(eventDate));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [eventDate]);

  if (countdown.formatted === 'Past') {
    return (
      <div className="text-sm text-gray-500 font-mono">
        Event passed
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Countdown Text */}
      <div className={`font-mono text-lg font-semibold ${countdown.colorClass}`}>
        {countdown.formatted}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              countdown.totalMinutes > 60
                ? 'bg-emerald-500'
                : countdown.totalMinutes > 15
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Time breakdown for urgent events */}
      {countdown.totalMinutes < 60 && countdown.totalMinutes > 0 && (
        <div className="text-xs text-gray-500 font-mono">
          {countdown.hours > 0 && `${countdown.hours}h `}
          {countdown.minutes}m {countdown.seconds}s
        </div>
      )}
    </div>
  );
}
