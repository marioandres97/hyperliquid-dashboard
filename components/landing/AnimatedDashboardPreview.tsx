'use client';

import { motion } from 'framer-motion';
import { MiniCalendarWidget } from './MiniCalendarWidget';
import { MiniOrdersFeed } from './MiniOrdersFeed';
import { MiniChart } from './MiniChart';

export function AnimatedDashboardPreview() {
  return (
    <div className="relative max-w-6xl mx-auto mt-16">
      {/* Glow effect behind */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-500/0 rounded-3xl blur-2xl -z-10" />
      
      <motion.div
        className="backdrop-blur-xl bg-white/5 border border-emerald-500/10 rounded-3xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      >
        {/* Grid of mini widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MiniCalendarWidget />
          <MiniOrdersFeed />
          <MiniChart />
        </div>

        {/* Helper text */}
        <p className="text-center mt-8 text-sm text-white/50">
          Click any widget to explore
        </p>
      </motion.div>
    </div>
  );
}
