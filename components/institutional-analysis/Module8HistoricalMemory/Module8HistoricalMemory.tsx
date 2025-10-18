'use client';

import React from 'react';
import { GlassCard, EducationalTooltip } from '../shared';
import { History, Repeat, Search, Sparkles } from 'lucide-react';
import { TraderTimeline } from './TraderTimeline';
import { RecurringPatterns } from './RecurringPatterns';
import { SimilarScenarios } from './SimilarScenarios';
import { PredictiveInsights } from './PredictiveInsights';

const Module8HistoricalMemory: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Educational Tooltip */}
      <EducationalTooltip
        sections={{
          howToAnalyze: [
            'Patrones recurrentes: Si funding >0.05% causó -2% 12/15 veces, es patrón confiable',
            'Escenarios similares: Condiciones actuales vs histórico → predice movimiento probable',
            'Timeline de traders: Ve cómo ballenas abren/cierran posiciones y cuándo toman profit',
            'Probabilidad predictiva: >70% indica alta confiabilidad basada en datos históricos',
          ],
          example: 'Patrón: "Funding >0.05% → Precio cae 2-4% en 4h (82% éxito, 15 veces)". Si funding está en 0.053%, espera caída pronto.',
          tip: 'Usa "Similar Scenarios" para ver qué pasó en situaciones idénticas. Si 3/3 escenarios similares subieron +3%, probabilidad alta de repetirse.',
        }}
      />

      <GlassCard variant="purple" padding="md">
        <div className="flex items-center gap-2 mb-6">
          <History className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-purple-200">Historical Memory & Pattern Recognition</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Patterns Tracked</div>
            <div className="text-2xl font-bold text-purple-300">847</div>
            <div className="text-xs text-purple-400 mt-1">Last 90 days</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-green-400">78.5%</div>
            <div className="text-xs text-green-400 mt-1">Pattern accuracy</div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div className="text-sm text-gray-400 mb-1">Active Signals</div>
            <div className="text-2xl font-bold text-blue-400">12</div>
            <div className="text-xs text-blue-400 mt-1">Current matches</div>
          </div>
        </div>
      </GlassCard>

      {/* Trader Timeline */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <History className="text-blue-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Trader Behavior Timeline</h3>
        </div>
        <TraderTimeline />
      </GlassCard>

      {/* Recurring Patterns */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Repeat className="text-yellow-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Recurring Market Patterns</h3>
        </div>
        <RecurringPatterns />
      </GlassCard>

      {/* Similar Scenarios */}
      <GlassCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="text-green-400" size={20} />
          <h3 className="text-lg font-bold text-gray-200">Similar Historical Scenarios</h3>
        </div>
        <SimilarScenarios />
      </GlassCard>

      {/* Predictive Insights */}
      <GlassCard variant="blue" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-blue-300">AI Predictive Insights</h3>
        </div>
        <PredictiveInsights />
      </GlassCard>
    </div>
  );
};

export default Module8HistoricalMemory;
