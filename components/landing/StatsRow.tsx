'use client';

import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

const stats = [
  { label: 'Orders Tracked', value: 2500000, suffix: '+', prefix: '' },
  { label: 'Active Users', value: 50000, suffix: '+', prefix: '' },
  { label: 'Uptime', value: 99.9, suffix: '%', prefix: '' },
  { label: 'Response Time', value: 50, suffix: 'ms', prefix: '<' },
];

function Counter({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const displayValue = latest.toFixed(value % 1 !== 0 ? 1 : 0);
        ref.current.textContent = `${prefix}${displayValue.toLocaleString()}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [springValue, suffix, prefix, value]);

  return <div ref={ref} />;
}

export function StatsRow() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl backdrop-blur-xl p-12"
          style={{
            background: 'rgba(31, 41, 55, 0.3)',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div 
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-clash-display)',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
