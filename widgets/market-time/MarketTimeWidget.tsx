'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function MarketTimeWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getUTCHours();
  const minutes = time.getUTCMinutes();
  const seconds = time.getUTCSeconds();

  const year = time.getUTCFullYear();
  const month = String(time.getUTCMonth() + 1).padStart(2, '0');
  const day = String(time.getUTCDate()).padStart(2, '0');
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = daysOfWeek[time.getUTCDay()];

  // Calculate rotation angles for analog clock
  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = ((hours % 12 + minutes / 60) / 12) * 360;

  // Pulse effect on minute change
  const isPulse = seconds === 0;

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 p-4">
      {/* Circular clock design background */}
      <div className="relative">
        {/* Analog Clock Visualization */}
        <div className={`relative w-32 h-32 rounded-full border-4 border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm transition-all duration-300 ${
          isPulse ? 'scale-110 border-cyan-400/60' : 'scale-100'
        }`}>
          {/* Clock center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20" />
          
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-0.5 h-2 bg-cyan-400/40"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-14px)`,
                transformOrigin: 'center'
              }}
            />
          ))}
          
          {/* Hour hand */}
          <div
            className="absolute top-1/2 left-1/2 w-1 h-8 bg-cyan-300 rounded-full origin-bottom transition-transform duration-500"
            style={{
              transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
              transformOrigin: 'bottom center'
            }}
          />
          
          {/* Minute hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-blue-300 rounded-full origin-bottom transition-transform duration-500"
            style={{
              transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
              transformOrigin: 'bottom center'
            }}
          />
          
          {/* Second hand */}
          <div
            className="absolute top-1/2 left-1/2 w-px h-14 bg-red-400 rounded-full origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
              transformOrigin: 'bottom center',
              transition: seconds === 0 ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
            }}
          />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl animate-pulse" />
        </div>
      </div>

      {/* Digital Time Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span className="text-xs text-cyan-400 font-medium tracking-wider">UTC TIME</span>
        </div>
        
        <div className={`text-5xl font-bold text-white tracking-wider transition-all duration-300 ${
          isPulse ? 'scale-105 text-cyan-300' : ''
        }`} style={{
          textShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
        }}>
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:<span className="text-cyan-400">{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Date Display */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/20 w-full">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-white/60">Date</span>
        </div>
        <div className="text-xl font-semibold text-white">
          {year}-{month}-{day}
        </div>
        <div className="text-sm text-cyan-400 mt-1">
          {dayOfWeek}
        </div>
      </div>

      {/* Timezone Indicator */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg px-4 py-2 border border-cyan-400/30">
        <div className="text-xs text-white/70">Timezone</div>
        <div className="text-lg font-bold text-cyan-300">UTC+0</div>
      </div>
    </div>
  );
}
