'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient with emerald glow */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            linear-gradient(to bottom, #064E3B 0%, #0D1B17 50%, #0A0E14 100%)
          `
        }}
      />

      <div className="container relative z-10 px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main heading with gradient text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6"
              style={{ 
                fontFamily: 'var(--font-clash-display)',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #00FF87 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.04em',
                lineHeight: '1.1',
              }}
            >
              VENOMOUZ
              <br />
              INSIGHTZ
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p 
            className="text-2xl sm:text-3xl md:text-4xl text-gray-200 font-semibold mb-4"
            style={{ 
              fontFamily: 'var(--font-clash-display)',
              letterSpacing: '-0.02em'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Elite Trading Intelligence
          </motion.p>

          {/* Subtitle */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            style={{ lineHeight: '1.8' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Real-time market intelligence powered by institutional-grade analytics. 
            Track whale movements, monitor large orders, and stay ahead of the market.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <Link href="/orders">
              <motion.button
                className="group px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#0A0E14',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 15px 50px rgba(16, 185, 129, 0.4)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/orders">
              <motion.button
                className="group px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3 backdrop-blur-xl"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981',
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Watch Demo
              </motion.button>
            </Link>
          </motion.div>

          {/* Animated dashboard mockup placeholder */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            <div 
              className="relative rounded-3xl overflow-hidden backdrop-blur-xl"
              style={{
                background: 'rgba(31, 41, 55, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400">Dashboard Preview</p>
                </div>
              </div>
              {/* Glow effect */}
              <div 
                className="absolute inset-0 -z-10 blur-3xl opacity-50"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
