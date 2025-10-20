'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center rounded-3xl backdrop-blur-xl p-16 relative overflow-hidden"
          style={{
            background: 'rgba(31, 41, 55, 0.3)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
          }}
        >
          {/* Background glow */}
          <div 
            className="absolute inset-0 -z-10 blur-3xl opacity-40"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
            }}
          />

          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            style={{
              fontFamily: 'var(--font-clash-display)',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #00FF87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              lineHeight: '1.2',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Level Up
            <br />
            Your Trading?
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join thousands of elite traders who trust Venomouz Insightz for real-time market intelligence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/orders">
              <motion.button
                className="group px-10 py-5 rounded-2xl font-bold text-xl flex items-center gap-3 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#0A0E14',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 15px 50px rgba(16, 185, 129, 0.5)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Start Trading Smarter
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.p 
            className="text-sm text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            No credit card required • Free to start • Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
