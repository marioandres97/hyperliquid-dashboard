'use client';

import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock, Activity } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30 backdrop-blur-sm border-b border-gray-800 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Hyperliquid Dashboard</h1>
            <p className="text-sm text-gray-400">Advanced signal detection system</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-financial text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{timeUTC} UTC</span>
        </div>
      </div>
    </header>
  );
}
