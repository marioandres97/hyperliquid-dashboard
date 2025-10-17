// widgets/liquidity-atlas-portal/LiquidityAtlasPortalWidget.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Compass, TrendingUp, Activity, MapPin } from 'lucide-react';

export default function LiquidityAtlasPortalWidget() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/liquidity-flow-map');
  };

  return (
    <div
      onClick={handleNavigate}
      className="relative overflow-hidden rounded-2xl cursor-pointer h-full group transition-all duration-500 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(147, 51, 234, 0.25) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.05)',
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
        }}
      />

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: 'inset 0 0 80px rgba(59, 130, 246, 0.4)',
        }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center space-y-6 p-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-blue-500 opacity-20 animate-pulse blur-xl" />
          
          <div
            className="relative p-6 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(59, 130, 246, 0.2))',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
            }}
          >
            <Compass className="w-16 h-16 text-yellow-300 group-hover:text-blue-300 transition-colors duration-500" strokeWidth={1.5} />
          </div>

          <div className="absolute -top-2 -right-2 animate-pulse">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-pulse delay-150">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3
            className="text-3xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #3b82f6 50%, #9333ea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
            }}
          >
            Liquidity Atlas Portal
          </h3>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-blue-500/20 border border-yellow-400/40">
            <MapPin className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold text-yellow-200 tracking-wide">PREMIUM ACCESS</span>
          </div>
        </div>

        <p className="text-gray-200 text-sm max-w-md leading-relaxed px-4">
          Accede al mapa interactivo de liquidez institucional y absorción de mercado en tiempo real
        </p>

        <button
          className="relative px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 group-hover:shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(59, 130, 246, 0.9))',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            }}
          />
          <span className="relative z-10 text-gray-900">Explorar Mapa de Liquidez</span>
        </button>

        <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-ping" />
        <div className="absolute bottom-20 right-16 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '300ms' }} />
        <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60 animate-ping" style={{ animationDelay: '500ms' }} />
      </div>

      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-yellow-400/40 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-400/40 rounded-br-2xl" />
    </div>
  );
}