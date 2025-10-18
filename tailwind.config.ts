import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./widgets/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'Monaco', 'monospace'],
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'premium-xs': ['0.7rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'premium-sm': ['0.8rem', { lineHeight: '1.2rem', letterSpacing: '0.03em' }],
        'premium-base': ['0.9rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'premium-lg': ['1.1rem', { lineHeight: '1.8rem', letterSpacing: '-0.01em' }],
        'premium-xl': ['1.4rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 4s infinite',
        'pulse-dot': 'pulse-dot 2s infinite',
        'shimmer': 'shimmer 2s infinite',
        'badge-pulse': 'badge-pulse 2s infinite',
        'scan': 'scan 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(10px)' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 2px)' },
          '94%': { transform: 'translate(2px, -2px)' },
        },
        'pulse-dot': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 10px #39FF14',
          },
          '50%': { 
            opacity: '0.5',
            boxShadow: '0 0 20px #39FF14',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'badge-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;