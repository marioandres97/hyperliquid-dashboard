'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface MarketStatus {
  status: 'OPEN' | 'CLOSED' | 'OPENS SOON' | 'CLOSES SOON';
  icon: string;
  message: string;
}

interface Market {
  name: string;
  emoji: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  isWeekdayOnly: boolean;
  isCME?: boolean;
}

const markets: Market[] = [
  { name: 'Tokyo', emoji: '', openHour: 0, openMinute: 0, closeHour: 9, closeMinute: 0, isWeekdayOnly: true },
  { name: 'London', emoji: '', openHour: 8, openMinute: 0, closeHour: 16, closeMinute: 30, isWeekdayOnly: true },
  { name: 'New York', emoji: '', openHour: 13, openMinute: 30, closeHour: 20, closeMinute: 0, isWeekdayOnly: true },
  { name: 'CME', emoji: '', openHour: 23, openMinute: 0, closeHour: 22, closeMinute: 0, isWeekdayOnly: false, isCME: true },
];

function getMarketStatus(currentTime: Date, market: Market): MarketStatus {
  const dayOfWeek = currentTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = currentTime.getUTCHours();
  const currentMinute = currentTime.getUTCMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // Check if it's weekend
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (market.isWeekdayOnly && isWeekend) {
    // Calculate time until Monday
    let daysUntilMonday = 0;
    if (dayOfWeek === 0) daysUntilMonday = 1; // Sunday
    if (dayOfWeek === 6) daysUntilMonday = 2; // Saturday
    
    const mondayOpenTime = new Date(currentTime);
    mondayOpenTime.setUTCDate(currentTime.getUTCDate() + daysUntilMonday);
    mondayOpenTime.setUTCHours(market.openHour, market.openMinute, 0, 0);
    
    const minutesUntilOpen = Math.floor((mondayOpenTime.getTime() - currentTime.getTime()) / 60000);
    const h = Math.floor(minutesUntilOpen / 60);
    const m = minutesUntilOpen % 60;
    
    return { status: 'CLOSED', icon: '🔴', message: `Opens in ${h}h ${m}m` };
  }

  // Special handling for CME (24/5 with break)
  if (market.isCME) {
    // CME is open Sunday 23:00 - Friday 22:00 with daily break 22:00-23:00
    const isFridayAfterClose = dayOfWeek === 5 && currentTotalMinutes >= 22 * 60;
    const isSaturdayOrSundayBeforeOpen = (dayOfWeek === 6) || (dayOfWeek === 0 && currentTotalMinutes < 23 * 60);
    
    if (isFridayAfterClose || isSaturdayOrSundayBeforeOpen) {
      // Calculate time until Sunday 23:00
      const sundayOpenTime = new Date(currentTime);
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      sundayOpenTime.setUTCDate(currentTime.getUTCDate() + daysUntilSunday);
      sundayOpenTime.setUTCHours(23, 0, 0, 0);
      
      const minutesUntilOpen = Math.floor((sundayOpenTime.getTime() - currentTime.getTime()) / 60000);
      const h = Math.floor(minutesUntilOpen / 60);
      const m = minutesUntilOpen % 60;
      
      return { status: 'CLOSED', icon: '🔴', message: `Opens in ${h}h ${m}m` };
    }
    
    // Check for daily break (22:00-23:00)
    const isInDailyBreak = currentTotalMinutes >= 22 * 60 && currentTotalMinutes < 23 * 60;
    if (isInDailyBreak) {
      const minutesUntilOpen = 23 * 60 - currentTotalMinutes;
      return { status: 'CLOSED', icon: '🔴', message: `Break, opens in ${minutesUntilOpen}m` };
    }
    
    // CME is open
    // Calculate time until next break/close
    let minutesUntilBreak: number;
    if (currentTotalMinutes < 22 * 60) {
      minutesUntilBreak = 22 * 60 - currentTotalMinutes;
    } else {
      // After daily break, calculate until next day's break
      minutesUntilBreak = (24 * 60 - currentTotalMinutes) + (22 * 60);
    }
    
    const h = Math.floor(minutesUntilBreak / 60);
    const m = minutesUntilBreak % 60;
    
    if (minutesUntilBreak < 30) {
      return { status: 'CLOSES SOON', icon: '🟠', message: `Break in ${m}m` };
    }
    
    return { status: 'OPEN', icon: '🟢', message: h > 0 ? `Break in ${h}h ${m}m` : '' };
  }

  // Standard market hours
  const openTotalMinutes = market.openHour * 60 + market.openMinute;
  const closeTotalMinutes = market.closeHour * 60 + market.closeMinute;

  // Check if market is open
  if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
    const minutesUntilClose = closeTotalMinutes - currentTotalMinutes;
    
    if (minutesUntilClose < 30) {
      return { status: 'CLOSES SOON', icon: '🟠', message: `Closes in ${minutesUntilClose}m` };
    }
    
    const h = Math.floor(minutesUntilClose / 60);
    const m = minutesUntilClose % 60;
    return { status: 'OPEN', icon: '🟢', message: `Closes in ${h}h ${m}m` };
  } else {
    // Market is closed, calculate time until open
    let minutesUntilOpen: number;
    
    if (currentTotalMinutes < openTotalMinutes) {
      // Same day opening
      minutesUntilOpen = openTotalMinutes - currentTotalMinutes;
    } else {
      // Next day opening
      minutesUntilOpen = (24 * 60 - currentTotalMinutes) + openTotalMinutes;
    }
    
    if (minutesUntilOpen < 30) {
      return { status: 'OPENS SOON', icon: '🟡', message: `Opens in ${minutesUntilOpen}m` };
    }
    
    const h = Math.floor(minutesUntilOpen / 60);
    const m = minutesUntilOpen % 60;
    return { status: 'CLOSED', icon: '🔴', message: `Opens in ${h}h ${m}m` };
  }
}

export default function MarketHoursBar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Set initial time on client
    setCurrentTime(new Date());
    
    // Check for reduced motion preference (only in browser)
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Update every minute
      
      return () => {
        clearInterval(interval);
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  // Return early if not yet hydrated
  if (!currentTime) {
    return (
      <div 
        className="sticky top-14 sm:top-16 lg:top-[72px] z-40 bg-gray-900/85 backdrop-blur-md border-b border-gray-800/30 py-2 sm:py-2.5"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
      >
        <div className="overflow-hidden">
          <div className="text-xs sm:text-sm font-medium tracking-wide text-gray-200 text-center">
            Loading market hours...
          </div>
        </div>
      </div>
    );
  }

  // Build market status content for each market
  const marketElements = markets.map((market) => {
    const status = getMarketStatus(currentTime, market);
    return (
      <span key={market.name} className="inline-flex items-center gap-1 whitespace-nowrap mx-3">
        <span className="text-gray-200">{market.name}:</span>
        <span>{status.icon}</span>
        <span className={`font-medium ${
          status.status === 'OPEN' ? 'text-green-400' :
          status.status === 'CLOSED' ? 'text-red-400' :
          status.status === 'OPENS SOON' ? 'text-yellow-400' :
          'text-orange-400'
        }`}>
          {status.status}
        </span>
        {status.message && (
          <span className="text-gray-400">({status.message})</span>
        )}
      </span>
    );
  });

  // If reduced motion is preferred, show static content
  if (prefersReducedMotion) {
    return (
      <div 
        className="sticky top-14 sm:top-16 lg:top-[72px] z-40 bg-gray-900/85 backdrop-blur-md border-b border-gray-800/30 py-2 sm:py-2.5"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
      >
        <div className="overflow-x-auto">
          <div className="flex items-center justify-center text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap px-4">
            {marketElements.map((element, index) => (
              <span key={index} className="inline-flex items-center">
                {element}
                {index < marketElements.length - 1 && <span className="text-gray-600 mx-3">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Animation duration - using a readable speed of ~40s for smooth scrolling
  const animationDuration = 40;

  // Memoize animation props to prevent unnecessary re-renders
  const animateProps = useMemo(() => ({
    x: isPaused ? undefined : [0, '-50%'],
  }), [isPaused]);

  const transitionProps = useMemo(() => ({
    x: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: animationDuration,
      ease: "linear" as const,
    },
  }), [animationDuration]);

  return (
    <div 
      className="sticky top-14 sm:top-16 lg:top-[72px] z-40 bg-gray-900/85 backdrop-blur-md border-b border-gray-800/30 py-2 sm:py-2.5"
      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)' }}
    >
      <div 
        className="overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex items-center text-xs sm:text-sm font-medium tracking-wide"
          animate={animateProps}
          transition={transitionProps}
        >
          {/* First copy of content */}
          {marketElements}
          <span className="text-gray-600 mx-3">•</span>
          {/* Second copy for seamless loop */}
          {marketElements}
        </motion.div>
      </div>
    </div>
  );
}
