'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, EducationalTooltip } from '../shared';
import { Clock, Calendar, TrendingUp, Brain } from 'lucide-react';
import { HourlyVolumeChart } from './HourlyVolumeChart';
import { MacroEventsCalendar } from './MacroEventsCalendar';
import { TraderTimingPatterns } from './TraderTimingPatterns';
import { BehavioralInsights } from './BehavioralInsights';

const Module7TimingAnalysis: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Educational Tooltip */}
      <EducationalTooltip
        sections={{
          howToAnalyze: [
            'Picos de volumen: Hora del día con más actividad institucional = mejor liquidez',
            'Eventos Macro: Trades grandes antes de CPI/Fed = posible información privilegiada',
            'Patrones horarios: Institucionales entran a horas específicas, seguir su timing',
            'Ventana de ejecución: 14:00-16:00 UTC típicamente tiene mejor liquidez y menos slippage',
          ],
          example: 'Si 60% del volumen ocurre 14:00-16:00 UTC, esa es tu mejor ventana para entrar/salir. Fuera de esas horas, espera mayor slippage.',
          tip: 'Evita operar 00:00-06:00 UTC (Asia dormida, USA cerrada). Liquidez baja = slippage alto. Espera London/NY open para mejores entradas.',
        }}
      />

      <GlassCard variant="purple" padding="md">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-purple-200">Timing Analysis</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Peak Trading Hours</div>
            <div className="text-2xl font-bold text-purple-300">14:00 - 16:00 UTC</div>
            <div className="text-xs text-purple-400 mt-1">60% of institutional volume</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Best Execution Window</div>
            <div className="text-2xl font-bold text-blue-300">13:00 - 17:00 UTC</div>
            <div className="text-xs text-blue-400 mt-1">Highest liquidity period</div>
          </div>
        </div>
      </GlassCard>

      {/* 24-Hour Volume Distribution */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-blue-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">24-Hour Volume Distribution</h3>
        </div>
        <HourlyVolumeChart />
      </GlassCard>

      {/* Macro Events Calendar */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-yellow-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Upcoming Macro Events</h3>
        </div>
        <MacroEventsCalendar />
      </GlassCard>

      {/* Trader Timing Patterns */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-green-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Top Trader Timing Patterns</h3>
        </div>
        <TraderTimingPatterns />
      </GlassCard>

      {/* Behavioral Insights */}
      <GlassCard variant="blue" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-blue-300">AI-Powered Timing Insights</h3>
        </div>
        <BehavioralInsights />
      </GlassCard>
    </div>
  );
};

export default Module7TimingAnalysis;
