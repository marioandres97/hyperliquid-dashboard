'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const features = [
  'Free during beta period',
  'Priority support access',
  'Influence product roadmap',
  'Early adopter perks',
];

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
            background: 'linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.05))',
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

          {/* Beta Badge with animated ping */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-xl"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-emerald-400">Open Beta • Limited Access</span>
          </motion.div>

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
            Join the Beta
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Be among the first to experience next-generation trading intelligence. Shape the future of professional trading tools.
          </motion.p>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
            {/* Crypto payment feature - centered and spans 2 cols */}
            <div className="md:col-span-2 flex items-center justify-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-gray-300">Crypto payments accepted (BTC, ETH, USDC)</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
                Request Beta Access
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.p 
            className="text-sm text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            No credit card required • Crypto & fiat accepted • Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
