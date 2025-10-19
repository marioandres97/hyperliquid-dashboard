'use client';

import { useState, useEffect, useRef } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Clock, Activity } from 'lucide-react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Set initial time on client
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    
    // Set initially
    updateHeaderHeight();
    
    // Update on window resize (for responsive padding changes)
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const timeUTC = currentTime ? formatInTimeZone(currentTime, 'UTC', 'HH:mm:ss') : '--:--:--';

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30 backdrop-blur-lg border-b border-gray-800 py-3 sm:py-4 lg:py-5"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Hyperliquid Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-400">Advanced signal detection system</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-financial text-gray-300">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{timeUTC} UTC</span>
          </div>
        </div>
      </div>
    </header>
  );
}
