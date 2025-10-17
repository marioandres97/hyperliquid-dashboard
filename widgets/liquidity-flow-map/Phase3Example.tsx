'use client';

import React, { useState } from 'react';
import {
  useLiquidityFlowData,
  useAbsorptionZones,
  useLiquidationCascades,
  useSupportResistance,
  usePatternDetection,
  useAlerts,
} from './hooks';
import {
  LiquidityHeatmap,
  TimeSeriesChart,
  FlowMetricsPanel,
  PatternInsights,
  PatternDetails,
  AlertPanel,
} from './components';
import type { Coin, TimeWindow, DetectedPattern } from './types';

/**
 * Comprehensive example demonstrating all Phase 3 enhanced features
 */

// Display constants
const MAX_DISPLAYED_ITEMS = 3; // Max items to show in analytics sections

export function Phase3Example() {
  const [coin, setCoin] = useState<Coin>('BTC');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('5m');
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);

  // Core liquidity flow data
  const { flowData, metrics, timeSeries } = useLiquidityFlowData({
    coin,
    timeWindow,
    updateInterval: 2000,
  });

  // Current price (estimated from recent trades with validation)
  const currentPrice = flowData?.trades && flowData.trades.length > 0
    ? flowData.trades[flowData.trades.length - 1].price
    : 0;

  // Phase 3: Pattern detection hooks
  const { zones: absorptionZones, activeZones } = useAbsorptionZones({
    coin,
    nodes: flowData?.nodes || new Map(),
    trades: flowData?.trades || [],
    currentPrice,
  });

  const { cascades, highRiskCascades } = useLiquidationCascades({
    coin,
    liquidations: flowData?.liquidations || [],
    currentPrice,
  });

  const { 
    levels: srLevels, 
    nearestSupport, 
    nearestResistance 
  } = useSupportResistance({
    coin,
    trades: flowData?.trades || [],
    nodes: flowData?.nodes || new Map(),
    currentPrice,
  });

  const { patterns, highConfidencePatterns } = usePatternDetection({
    coin,
    absorptionZones: activeZones,
    cascades: highRiskCascades,
    srLevels,
    metrics,
    currentPrice,
  });

  // Alert system
  const {
    alerts,
    unacknowledgedAlerts,
    alertCount,
    acknowledgeAlert,
    acknowledgeAll,
  } = useAlerts({
    coin,
    config: {
      enabled: true,
      minSeverity: 'low',
      notificationSound: true,
    },
  });

  // Helper to format strength values consistently
  const formatStrength = (strength: number): string => {
    return strength.toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🚀 Phase 3: Enhanced Liquidity Flow Map
              </h1>
              <p className="text-white/60">
                Advanced pattern detection, absorption zones, cascade analysis & intelligent alerts
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex gap-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Coin</label>
                <select
                  value={coin}
                  onChange={(e) => setCoin(e.target.value as Coin)}
                  className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="HYPE">HYPE</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-white/60 mb-1 block">Time Window</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
                  className="bg-white/10 text-white rounded-lg px-4 py-2 border border-white/20"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
              <div className="text-sm text-white/60 mb-1">Absorption Zones</div>
              <div className="text-2xl font-bold text-blue-400">{activeZones.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-500/30">
              <div className="text-sm text-white/60 mb-1">High Risk Cascades</div>
              <div className="text-2xl font-bold text-orange-400">{highRiskCascades.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
              <div className="text-sm text-white/60 mb-1">S/R Levels</div>
              <div className="text-2xl font-bold text-green-400">{srLevels.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
              <div className="text-sm text-white/60 mb-1">Active Alerts</div>
              <div className="text-2xl font-bold text-purple-400">{alertCount}</div>
            </div>
          </div>

          {/* Nearest S/R Levels */}
          {(nearestSupport || nearestResistance) && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {nearestSupport && (
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🛡️</span>
                    <span className="text-sm text-green-300 font-semibold">Nearest Support</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    ${nearestSupport.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    Strength: {nearestSupport.strength}% · {nearestSupport.touchCount} touches
                  </div>
                </div>
              )}
              
              {nearestResistance && (
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚧</span>
                    <span className="text-sm text-red-300 font-semibold">Nearest Resistance</span>
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    ${nearestResistance.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    Strength: {nearestResistance.strength}% · {nearestResistance.touchCount} touches
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alerts Panel */}
        {unacknowledgedAlerts.length > 0 && (
          <AlertPanel
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onAcknowledgeAll={acknowledgeAll}
            maxVisible={3}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patterns & Details */}
          <div className="space-y-6">
            <PatternInsights
              patterns={highConfidencePatterns}
              onPatternClick={setSelectedPattern}
            />
            
            {selectedPattern && (
              <PatternDetails
                pattern={selectedPattern}
                onClose={() => setSelectedPattern(null)}
              />
            )}
          </div>

          {/* Right Column - Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            <FlowMetricsPanel
              metrics={metrics}
              lastUpdate={new Date()}
              patterns={patterns}
              showPatterns={true}
            />

            <TimeSeriesChart
              timeSeries={timeSeries}
              supportResistanceLevels={srLevels}
              showSRLevels={true}
            />

            {flowData && flowData.nodes.size > 0 && (
              <LiquidityHeatmap
                nodes={flowData.nodes}
                currentPrice={currentPrice}
                absorptionZones={absorptionZones}
                supportResistanceLevels={srLevels}
                showPatterns={true}
              />
            )}
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Advanced Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Absorption Zones */}
            <div>
              <h4 className="text-sm font-semibold text-blue-300 mb-3">Absorption Zones</h4>
              {activeZones.length > 0 ? (
                <div className="space-y-2">
                  {activeZones.slice(0, MAX_DISPLAYED_ITEMS).map((zone) => (
                    <div key={zone.id} className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white/80 font-medium">
                          {zone.side === 'buy' ? '📈' : '📉'} ${zone.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-white/50">{formatStrength(zone.strength)}%</span>
                      </div>
                      <div className="text-xs text-white/60">
                        {zone.whaleActivity && '🐋 '}{zone.tradeCount} trades
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No active zones</p>
              )}
            </div>

            {/* Liquidation Cascades */}
            <div>
              <h4 className="text-sm font-semibold text-orange-300 mb-3">Cascade Risks</h4>
              {cascades.length > 0 ? (
                <div className="space-y-2">
                  {cascades.slice(0, MAX_DISPLAYED_ITEMS).map((cascade) => (
                    <div key={cascade.id} className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white/80 font-medium">
                          ${cascade.priceLevel.toFixed(2)}
                        </span>
                        <span className={`text-xs font-semibold ${
                          cascade.risk === 'high' ? 'text-red-400' :
                          cascade.risk === 'medium' ? 'text-orange-400' :
                          'text-yellow-400'
                        }`}>
                          {cascade.risk.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        {cascade.liquidationCount} liquidations · {cascade.side}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No cascades detected</p>
              )}
            </div>

            {/* S/R Levels */}
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-3">Key Levels</h4>
              {srLevels.length > 0 ? (
                <div className="space-y-2">
                  {srLevels.slice(0, MAX_DISPLAYED_ITEMS).map((level) => (
                    <div key={level.id} className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white/80 font-medium">
                          {level.type === 'support' ? '🛡️' : '🚧'} ${level.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-white/50">{level.strength}%</span>
                      </div>
                      <div className="text-xs text-white/60">
                        {level.touchCount} touches · {level.type}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No levels detected</p>
              )}
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📚 Phase 3 Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">Enhanced Detection</h4>
              <ul className="space-y-1 text-white/70">
                <li>• Absorption zone identification</li>
                <li>• Liquidation cascade risk analysis</li>
                <li>• Support/Resistance level detection</li>
                <li>• Whale activity tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Smart Alerts</h4>
              <ul className="space-y-1 text-white/70">
                <li>• Real-time pattern notifications</li>
                <li>• Configurable severity levels</li>
                <li>• Audio & visual alerts</li>
                <li>• Auto-acknowledgement options</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
