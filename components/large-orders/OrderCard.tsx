'use client';

import { motion } from 'framer-motion';
import type { LargeOrder } from '@/types/large-orders';
import { WhaleIndicator } from './WhaleIndicator';
import { formatUsdValue, getRelativeTime } from '@/lib/large-orders/types';

interface OrderCardProps {
  order: LargeOrder;
  index: number;
}

export function OrderCard({ order, index }: OrderCardProps) {
  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
      className="relative rounded-lg overflow-hidden group"
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm" />
      <div className="absolute inset-0 border border-white/5 rounded-lg group-hover:border-white/10 transition-colors" />
      
      <div className="relative p-3 space-y-2">
        {/* Top row: Coin + Side badge + Whale indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">{order.coin}</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                order.side === 'BUY'
                  ? 'bg-green-500/20 text-green-400 shadow-sm shadow-green-500/20'
                  : 'bg-red-500/20 text-red-400 shadow-sm shadow-red-500/20'
              }`}
            >
              {order.side}
            </span>
            <WhaleIndicator isWhale={order.isWhale || false} size="sm" />
          </div>
          <div className="text-xs text-gray-400 font-mono">
            {getRelativeTime(order.timestamp)}
          </div>
        </div>
        
        {/* Price - Large, monospace */}
        <div className="text-xl font-bold text-white font-mono">
          ${order.price.toLocaleString()}
        </div>
        
        {/* Size + USD Value */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-500 mb-0.5">Size</div>
            <div className="text-white font-mono font-medium">{order.size.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-0.5">USD Value</div>
            <div className="text-white font-mono font-semibold">{formatUsdValue(order.usdValue)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
