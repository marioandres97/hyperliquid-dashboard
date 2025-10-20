'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  size: string;
  asset: string;
  time: string;
  side: 'BUY' | 'SELL';
}

const mockOrders: Order[] = [
  { id: '1', size: '$2.4M', asset: 'BTC', time: '2s ago', side: 'BUY' },
  { id: '2', size: '$1.8M', asset: 'ETH', time: '15s ago', side: 'SELL' },
  { id: '3', size: '$950K', asset: 'HYPE', time: '28s ago', side: 'BUY' },
  { id: '4', size: '$3.2M', asset: 'BTC', time: '45s ago', side: 'BUY' },
  { id: '5', size: '$1.1M', asset: 'ETH', time: '1m ago', side: 'SELL' },
];

export function MiniOrdersFeed() {
  const [orders, setOrders] = useState<Order[]>(mockOrders.slice(0, 3));
  const [orderIndex, setOrderIndex] = useState(3);

  useEffect(() => {
    // Add a new order every 5 seconds
    const interval = setInterval(() => {
      setOrders((prev) => {
        const newOrder = mockOrders[orderIndex % mockOrders.length];
        const updated = [
          { ...newOrder, id: `${Date.now()}-${orderIndex}`, time: 'Just now' },
          ...prev.slice(0, 2),
        ];
        return updated;
      });
      setOrderIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderIndex]);

  return (
    <Link href="/orders">
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
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Large Orders</h3>
          </div>

          {/* Orders Feed */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{order.asset}</span>
                    <span className={`text-xs font-semibold ${
                      order.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {order.side}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{order.size}</span>
                    <span className="text-xs text-gray-500">{order.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Hover CTA */}
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
