'use client';

import { useState, useEffect, useRef } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Activity } from 'lucide-react';

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
      className="relative z-50 py-3 sm:py-4 lg:py-5"
      style={{
        background: 'rgba(15, 20, 25, 0.6)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(107, 70, 193, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 40px rgba(107, 70, 193, 0.1)',
      }}
    >
      {/* Gradient border top */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(107, 70, 193, 0.6) 20%, rgba(16, 185, 129, 0.4) 50%, rgba(245, 158, 11, 0.5) 80%, transparent 100%)',
        }}
      />
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logo with pulse animation */}
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-lg bg-purple-500/20 blur-md"
                style={{
                  animation: 'logo-pulse 3s ease-in-out infinite',
                }}
              />
              <Activity className="relative w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
            </div>
            
            <div>
              {/* Gradient title */}
              <h1 
                className="text-xl sm:text-2xl lg:text-3xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #10b981 50%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Hyperliquid Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 font-light">Advanced signal detection system</p>
            </div>
          </div>
          
          {/* Premium UTC Clock */}
          <div className="relative group">
            {/* Glassmorphism with gradient border */}
            <div 
              className="absolute -inset-[1px] rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(107, 70, 193, 0.4) 0%, rgba(16, 185, 129, 0.3) 100%)',
              }}
            />
            <div 
              className="relative rounded-xl overflow-hidden"
              style={{
                background: 'rgba(20, 25, 30, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Subtle glow effect on hover */}
              <div 
                className="absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
                style={{
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
                }}
              />
              
              {/* Clock content */}
              <div className="relative px-4 sm:px-5 py-2 sm:py-2.5">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-base sm:text-lg lg:text-xl font-light text-white/90 tracking-wide font-mono"
                    style={{ fontFeatureSettings: '"tnum"' }}
                  >
                    {timeUTC}
                  </span>
                  <span className="text-xs sm:text-sm font-light text-white/40 tracking-widest">
                    UTC
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
