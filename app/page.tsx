'use client';

import { Hero } from '@/components/landing/Hero';
import { ValueProps } from '@/components/landing/ValueProps';
import { ToolsShowcase } from '@/components/landing/ToolsShowcase';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { StatsRow } from '@/components/landing/StatsRow';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function Landing() {
  return (
    <div 
      className="min-h-screen grain-overlay fade-in"
      style={{ 
        background: `linear-gradient(to bottom, var(--venom-gradient-start), var(--venom-gradient-mid), var(--venom-gradient-end))`,
        fontFamily: 'var(--apple-font-system)',
        letterSpacing: 'var(--apple-letter-spacing)',
      }}
    >
      <Hero />
      <ValueProps />
      <ToolsShowcase />
      <LiveDemo />
      <StatsRow />
      <FinalCTA />

      {/* Footer */}
      <footer className="border-t py-6" style={{ borderColor: 'var(--venom-gray-800)' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            Elite trading platform. Not financial advice. DYOR. Trading involves substantial risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
