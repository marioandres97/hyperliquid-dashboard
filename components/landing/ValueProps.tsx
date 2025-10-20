'use client';

import { motion } from 'framer-motion';
import { Zap, Brain, Shield } from 'lucide-react';

const valueProps = [
  {
    icon: Zap,
    title: 'Real-Time Intelligence',
    description: 'Track every major market move as it happens. Live order flow, instant alerts, zero delay.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Machine learning algorithms analyze patterns, predict trends, and surface opportunities.',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Enterprise-grade encryption, secure authentication, and privacy-first architecture.',
  },
];

export function ValueProps() {
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
            }}
          >
            Why Elite Traders Choose Us
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <div 
                  className="h-full p-8 rounded-3xl backdrop-blur-xl transition-all duration-500"
                  style={{
                    background: 'rgba(31, 41, 55, 0.3)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: '#10B981' }} />
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{
                      fontFamily: 'var(--font-clash-display)',
                      color: '#10B981',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {prop.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
