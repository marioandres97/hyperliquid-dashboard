'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatUsdValue, getRelativeTime } from '@/lib/large-orders/types';
import { getSeverityColor, getPatternIcon, type WhalePattern } from '@/lib/large-orders/whale-patterns';
import { AlertTriangle } from 'lucide-react';

interface WhalePatternsProps {
  patterns: WhalePattern[];
}

export function WhalePatternsSidebar({ patterns }: WhalePatternsProps) {
  if (patterns.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/5 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10">
            <AlertTriangle className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Whale Patterns</h3>
        </div>
        <p className="text-sm text-gray-400">No patterns detected yet</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/5 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10">
            <AlertTriangle className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Whale Patterns</h3>
            <p className="text-xs text-gray-400">{patterns.length} detected</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {patterns.map((pattern) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              layout
              className={`relative rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.01] ${getSeverityColor(pattern.severity)}`}
            >
              {/* Pattern Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPatternIcon(pattern.type)}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{pattern.coin}</div>
                    <div className="text-xs text-gray-400 font-mono">
                      {getRelativeTime(pattern.timestamp)}
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                  pattern.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  pattern.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  pattern.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {pattern.severity}
                </div>
              </div>

              {/* Pattern Description */}
              <p className="text-xs text-gray-300 mb-3">{pattern.description}</p>

              {/* Pattern Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-gray-500 mb-0.5">Total Volume</div>
                  <div className="text-white font-mono font-semibold">
                    {formatUsdValue(pattern.totalVolume)}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <div className="text-gray-500 mb-0.5">Avg Size</div>
                  <div className="text-white font-mono font-semibold">
                    {formatUsdValue(pattern.avgSize)}
                  </div>
                </div>
              </div>

              {/* Orders Count */}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <span>🐋</span>
                <span>{pattern.orders.length} whale orders</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
