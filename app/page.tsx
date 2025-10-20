'use client';

import { Hero } from '@/components/landing/Hero';
import { ValueProps } from '@/components/landing/ValueProps';
import { ToolsShowcase } from '@/components/landing/ToolsShowcase';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function Landing() {
  return (
    <div 
      className="min-h-screen grain-overlay fade-in"
      style={{ 
        background: `
          linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px),
          radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%),
          rgb(3, 7, 18)
        `,
        backgroundSize: '50px 50px, 50px 50px, 100% 100%, 100% 100%',
        backgroundPosition: '0 0, 0 0, center, center',
        fontFamily: 'var(--apple-font-system)',
        letterSpacing: 'var(--apple-letter-spacing)',
      }}
    >
      <Hero />
      <ValueProps />
      <ToolsShowcase />
      <LiveDemo />
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
