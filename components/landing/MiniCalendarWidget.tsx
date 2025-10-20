'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

export function MiniCalendarWidget() {
  const [countdown, setCountdown] = useState('2h 15m 30s');

  useEffect(() => {
    // Mock countdown that updates every second
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const totalSeconds = 7200 + 900 + 30 - elapsed; // Start from 2h 15m 30s
      
      if (totalSeconds <= 0) {
        setCountdown('Event Started');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/calendar">
      <motion.div
        className="group relative h-full backdrop-blur-xl bg-white/5 border border-emerald-500/10 rounded-2xl p-6 cursor-pointer overflow-hidden"
        whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.3)' }}
        transition={{ duration: 0.2 }}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Icon and Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Economic Calendar</h3>
          </div>

          {/* Live Countdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Next Event:</span>
              <span className="text-emerald-400 font-mono text-sm font-semibold">{countdown}</span>
            </div>
            <div className="space-y-1">
              <p className="text-white font-semibold">NFP Report</p>
              <p className="text-xs text-gray-400">Non-Farm Payrolls • High Impact</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Forecast: 185K</span>
                <span>•</span>
                <span>Previous: 199K</span>
              </div>
            </div>
          </div>

          {/* Hover CTA */}
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>View Calendar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
