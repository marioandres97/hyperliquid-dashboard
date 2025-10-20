'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { DollarSign, ArrowRight, TrendingUp } from 'lucide-react';

export function MiniChart() {
  // Simple SVG line chart with gradient
  const points = [
    { x: 0, y: 60 },
    { x: 20, y: 45 },
    { x: 40, y: 50 },
    { x: 60, y: 30 },
    { x: 80, y: 35 },
    { x: 100, y: 20 },
  ];

  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const areaPathData = `${pathData} L 100 80 L 0 80 Z`;

  return (
    <Link href="/pnl">
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
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Trading Journal</h3>
          </div>

          {/* P&L Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">+$12,450</span>
              <span className="flex items-center gap-1 text-sm text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>+23.5%</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Win Rate: <span className="text-white font-semibold">68%</span></span>
              <span>•</span>
              <span>Trades: <span className="text-white font-semibold">142</span></span>
            </div>
          </div>

          {/* Mini Chart */}
          <svg 
            viewBox="0 0 100 80" 
            className="w-full h-16"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={areaPathData}
              fill="url(#chartGradient)"
            />
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Hover CTA */}
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>View Journal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
