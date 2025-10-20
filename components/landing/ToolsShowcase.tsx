'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, TrendingUp, DollarSign, Bell } from 'lucide-react';

const tools = [
  {
    icon: Calendar,
    title: 'Economic Calendar',
    description: 'Track market-moving events before they happen',
    href: '/calendar',
    gridClass: 'md:col-span-2 lg:col-span-2',
    preview: '📅 Next: Fed Rate Decision in 2h',
  },
  {
    icon: TrendingUp,
    title: 'Large Orders',
    description: 'Monitor whale movements in real-time',
    href: '/orders',
    gridClass: 'md:col-span-2 lg:col-span-1',
    preview: '🐋 $2.4M BTC Buy',
  },
  {
    icon: DollarSign,
    title: 'PnL Tracker',
    description: 'Analyze your trading performance',
    href: '/pnl',
    gridClass: 'md:col-span-2 lg:col-span-2',
    preview: '💰 +$12,450 Today',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Never miss critical price movements',
    href: '/alerts',
    gridClass: 'md:col-span-2 lg:col-span-1',
    preview: '🔔 3 Active Alerts',
  },
];

export function ToolsShowcase() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-clash-display)',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              lineHeight: '1.2',
            }}
          >
            Premium Trading Tools
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to trade like a professional
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={tool.gridClass}
              >
                <Link href={tool.href} className="block h-full group">
                  <motion.div
                    className="h-full min-h-[300px] p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all duration-500"
                    style={{
                      background: 'rgba(31, 41, 55, 0.3)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {/* Icon */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      }}
                    >
                      <Icon className="w-7 h-7" style={{ color: '#10B981' }} />
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 
                        className="text-2xl font-bold mb-2"
                        style={{
                          fontFamily: 'var(--font-clash-display)',
                          color: '#10B981',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {tool.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {tool.description}
                      </p>
                    </div>

                    {/* Live Preview */}
                    <div 
                      className="absolute bottom-8 left-8 right-8 p-4 rounded-xl backdrop-blur-md text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#10B981',
                      }}
                    >
                      {tool.preview}
                    </div>

                    {/* Hover glow */}
                    <div 
                      className="absolute inset-0 -z-10 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.5) 0%, transparent 70%)',
                      }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
