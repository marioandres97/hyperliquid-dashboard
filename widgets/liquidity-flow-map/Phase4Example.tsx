'use client';

import React, { useState, useCallback } from 'react';
import {
  useHistoryPlayback,
  useVolumeProfile,
  useMeanReversion,
  useTradeSetups,
  useLiquidityFlowData,
  usePatternDetection,
  useAbsorptionZones,
  useSupportResistance,
} from './hooks';
import {
  HistoryPlaybackControls,
  VolumeProfileChart,
  SetupDetailModal,
  PerformanceTracker,
  PatternInsights,
  FlowMetricsPanel,
} from './components';
import { getExportService } from './services/exportService';
import type { Coin, TradeSetup } from './types';

export interface Phase4ExampleProps {
  coin?: Coin;
}

export function Phase4Example({ coin = 'BTC' }: Phase4ExampleProps) {
  const [currentPrice] = useState(50000); // Mock price
  const [selectedSetup, setSelectedSetup] = useState<TradeSetup | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Core flow data
  const { flowData, metrics, timeSeries, isCollecting } = useLiquidityFlowData({
    coin,
    timeWindow: '5m',
    updateInterval: 1000,
  });

  // Phase 3 analytics
  const { patterns } = usePatternDetection({
    coin,
    absorptionZones: [],
    cascades: [],
    srLevels: [],
    metrics,
    currentPrice,
  });

  const { zones: absorptionZones } = useAbsorptionZones({
    coin,
    nodes: flowData?.nodes || new Map(),
    trades: flowData?.trades || [],
    currentPrice,
  });

  const { levels: srLevels } = useSupportResistance({
    coin,
    trades: flowData?.trades || [],
    nodes: flowData?.nodes || new Map(),
    currentPrice,
  });

  // Phase 4 - History Playback
  const {
    playbackState,
    currentSnapshot,
    progress,
    isPlaying,
    canPlay,
    play,
    pause,
    stop,
    seekTo,
    stepForward,
    stepBackward,
    setSpeed,
    setDirection,
    addSnapshot,
  } = useHistoryPlayback({
    coin,
    autoRecord: true,
    recordInterval: 5000,
  });

  // Record snapshots periodically
  React.useEffect(() => {
    if (flowData && metrics) {
      const timer = setInterval(() => {
        addSnapshot(flowData, patterns, [], currentPrice);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [flowData, metrics, patterns, currentPrice, addSnapshot]);

  // Phase 4 - Volume Profile
  const { volumeProfile, isInValueArea } = useVolumeProfile({
    coin,
    trades: flowData?.trades || [],
    nodes: flowData?.nodes,
    currentPrice,
  });

  // Phase 4 - Mean Reversion
  const { setups: meanReversionSetups, bestSetup: bestMRSetup } = useMeanReversion({
    coin,
    trades: flowData?.trades || [],
    currentPrice,
    metrics: metrics || undefined,
  });

  // Phase 4 - Trade Setups
  const {
    setups,
    activeSetups,
    longSetups,
    shortSetups,
    bestSetup,
    getPerformance,
    allPerformance,
  } = useTradeSetups({
    coin,
    currentPrice,
    patterns,
    volumeProfile: volumeProfile || undefined,
    meanReversion: bestMRSetup || undefined,
    absorptionZones,
    supportResistance: srLevels,
  });

  // Export handlers
  const exportService = getExportService();

  const handleExportScreenshot = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportService.exportScreenshot('phase4-dashboard');
      exportService.download(result);
    } catch (error) {
      console.error('Export screenshot failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!flowData) return;
    const result = exportService.exportCSV(flowData);
    exportService.download(result);
  }, [flowData]);

  const handleExportJSON = useCallback(() => {
    const data = {
      coin,
      timestamp: Date.now(),
      flowData,
      metrics,
      patterns,
      setups,
      volumeProfile,
    };
    const result = exportService.exportJSON(data);
    exportService.download(result);
  }, [coin, flowData, metrics, patterns, setups, volumeProfile]);

  const handleExportPDF = useCallback(async () => {
    if (!metrics) return;
    setIsExporting(true);
    try {
      const result = await exportService.exportPDF(
        `${coin} Liquidity Flow Analysis`,
        metrics,
        patterns,
        setups
      );
      exportService.download(result);
    } catch (error) {
      console.error('Export PDF failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [coin, metrics, patterns, setups]);

  const handleSelectSetup = useCallback((setupId: string) => {
    const setup = setups.find(s => s.id === setupId);
    if (setup) {
      setSelectedSetup(setup);
    }
  }, [setups]);

  return (
    <div id="phase4-dashboard" className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Phase 4: Advanced Analytics
              </h1>
              <p className="text-white/60">
                Complete trading system with history playback, volume profile, and automated setups
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportScreenshot}
                disabled={isExporting}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm transition-colors"
              >
                📸 Screenshot
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!flowData}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm transition-colors"
              >
                📊 CSV
              </button>
              <button
                onClick={handleExportJSON}
                disabled={!flowData}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-sm transition-colors"
              >
                💾 JSON
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!metrics}
                className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm transition-colors"
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>

        {/* History Playback Controls */}
        <HistoryPlaybackControls
          playbackState={playbackState}
          progress={progress}
          isPlaying={isPlaying}
          canPlay={canPlay}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSeekTo={seekTo}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onSpeedChange={setSpeed}
          onDirectionChange={setDirection}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flow Metrics */}
          {metrics && (
            <FlowMetricsPanel
              metrics={metrics}
            />
          )}

          {/* Volume Profile */}
          {volumeProfile && (
            <VolumeProfileChart
              volumeProfile={volumeProfile}
              currentPrice={currentPrice}
              showMarkers
              showDelta
            />
          )}
        </div>

        {/* Patterns and Setups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pattern Insights */}
          <PatternInsights
            patterns={patterns}
            onPatternClick={(pattern) => console.log('Pattern clicked:', pattern)}
          />

          {/* Trade Setups Summary */}
          <div className="glass rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span>🎯</span>
                <span>Trade Setups</span>
              </h3>
              <span className="text-sm text-white/60">{setups.length} active</span>
            </div>

            {setups.length === 0 ? (
              <p className="text-center text-white/60 py-8">No setups available</p>
            ) : (
              <div className="space-y-3">
                {setups.slice(0, 5).map((setup) => (
                  <div
                    key={setup.id}
                    onClick={() => setSelectedSetup(setup)}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-white">{setup.description}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            setup.type === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {setup.type.toUpperCase()}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                            Q: {setup.quality.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">Entry</p>
                        <p className="text-lg font-bold text-white">${setup.entry.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Target: ${setup.target1.toFixed(2)}</span>
                      <span>R:R: 1:{setup.riskRewardRatio.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {setups.length > 5 && (
              <p className="text-center text-sm text-white/60 mt-3">
                +{setups.length - 5} more setups
              </p>
            )}
          </div>
        </div>

        {/* Performance Tracker */}
        <PerformanceTracker
          performances={allPerformance}
          setups={setups}
          onSelectSetup={handleSelectSetup}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Active Setups</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-400">{activeSetups.length}</span>
              <span className="text-sm text-white/60">
                ({longSetups.length}L / {shortSetups.length}S)
              </span>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Best Setup Quality</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-400">
                {bestSetup ? bestSetup.quality.toFixed(0) : '0'}
              </span>
              <span className="text-sm text-white/60">/ 100</span>
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white/60 mb-2">Value Area Status</h4>
            <div className="text-xl font-semibold">
              {isInValueArea ? (
                <span className="text-green-400">✓ In Value Area</span>
              ) : (
                <span className="text-orange-400">⚠ Outside VA</span>
              )}
            </div>
          </div>
        </div>

        {/* Mean Reversion Setups */}
        {meanReversionSetups.length > 0 && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Mean Reversion Opportunities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meanReversionSetups.map((mrSetup) => (
                <div key={mrSetup.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      mrSetup.type === 'oversold' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {mrSetup.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-white/60">
                      {mrSetup.deviation.toFixed(2)}σ
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-white/60">Current</p>
                      <p className="text-lg font-semibold text-white">${mrSetup.currentPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Mean</p>
                      <p className="text-lg font-semibold text-white">${mrSetup.meanPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Probability</p>
                      <p className="text-lg font-semibold text-purple-400">
                        {(mrSetup.reversionProbability * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Strength</p>
                      <p className="text-lg font-semibold text-blue-400">
                        {mrSetup.strength.toFixed(0)}/100
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Setup Detail Modal */}
      {selectedSetup && (
        <SetupDetailModal
          setup={selectedSetup}
          performance={getPerformance(selectedSetup.id)}
          onClose={() => setSelectedSetup(null)}
          onTrigger={() => {
            console.log('Setup triggered:', selectedSetup.id);
            setSelectedSetup(null);
          }}
        />
      )}
    </div>
  );
}
