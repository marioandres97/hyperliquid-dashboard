'use client';

import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeUTC = currentTime ? formatInTimeZone(currentTime, 'UTC', 'HH:mm:ss') : '--:--:--';

  return (
    <header className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30 border-b border-gray-800 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hyperliquid Dashboard</h1>
          <p className="text-sm text-gray-400">Advanced crypto analytics platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono text-gray-300">
          <span className="text-xl">🕐</span>
          <span>{timeUTC} UTC</span>
        </div>
      </div>
    </header>
  );
}
