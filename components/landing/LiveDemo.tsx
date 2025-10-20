'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Mock live data
const mockWhaleAlerts = [
  { id: 1, type: 'BUY', amount: '$2.4M', asset: 'BTC', time: 'Just now' },
  { id: 2, type: 'SELL', amount: '$1.8M', asset: 'ETH', time: '2s ago' },
  { id: 3, type: 'BUY', amount: '$3.2M', asset: 'SOL', time: '5s ago' },
];

export function LiveDemo() {
  const [pressureValue, setPressureValue] = useState(65);
  const [alerts, setAlerts] = useState(mockWhaleAlerts);

  useEffect(() => {
    // Simulate live pressure gauge updates
    const pressureInterval = setInterval(() => {
      setPressureValue(prev => {
        const change = Math.random() * 10 - 5;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 2000);

    // Simulate new whale alerts
    const alertsInterval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        amount: `$${(Math.random() * 3 + 1).toFixed(1)}M`,
        asset: ['BTC', 'ETH', 'SOL', 'AVAX'][Math.floor(Math.random() * 4)],
        time: 'Just now',
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 2)]);
    }, 4000);

    return () => {
      clearInterval(pressureInterval);
      clearInterval(alertsInterval);
    };
  }, []);

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
            Live Market Intelligence
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            This is what you&apos;ll see. Live.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pressure Gauge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl backdrop-blur-xl"
            style={{
              background: 'rgba(31, 41, 55, 0.3)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 className="text-xl font-bold mb-6 text-emerald-400" style={{ fontFamily: 'var(--font-clash-display)' }}>
              Market Pressure
            </h3>
            
            {/* Circular gauge */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.1)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#pressureGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - pressureValue / 100)}`}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-emerald-400" style={{ fontFamily: 'var(--font-clash-display)' }}>
                  {pressureValue.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">
                  {pressureValue > 60 ? 'Bullish' : pressureValue < 40 ? 'Bearish' : 'Neutral'}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              Real-time buy/sell pressure analysis
            </div>
          </motion.div>

          {/* Whale Alerts Stream */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl backdrop-blur-xl"
            style={{
              background: 'rgba(31, 41, 55, 0.3)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-emerald-400" style={{ fontFamily: 'var(--font-clash-display)' }}>
                Whale Alerts
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">LIVE</span>
              </div>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl backdrop-blur-md"
                  style={{
                    background: alert.type === 'BUY' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${alert.type === 'BUY' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(239, 68, 68, 0.2)'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{
                          background: alert.type === 'BUY' 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : 'rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        🐋
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          <span style={{ color: alert.type === 'BUY' ? '#10B981' : '#EF4444' }}>
                            {alert.type}
                          </span>
                          {' '}{alert.amount}
                        </div>
                        <div className="text-xs text-gray-400">{alert.asset}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{alert.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
