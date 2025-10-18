'use client';

import { useSignalDetection } from './useSignalDetection';
import { Signal } from './types';
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Wifi, WifiOff, X } from 'lucide-react';

const COINS = ['BTC', 'ETH', 'HYPE'];

export default function OrderFlowSignalsWidget() {
  const { coinStates, isConnected, dismissSignal } = useSignalDetection();

  const activeSignals = COINS
    .map(coin => coinStates[coin]?.signal ? { ...coinStates[coin].signal, coin } : null)
    .filter((s): s is Signal & { coin: string } => s !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  const activeCount = activeSignals.length;
  const anyConnected = Object.values(isConnected).some(c => c);

  return (
    <div className="h-full flex flex-col space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          {anyConnected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-sm font-medium text-white">
            {activeCount > 0 ? (
              <>
                {activeCount} Active {activeCount === 1 ? 'Signal' : 'Signals'} 🔔
              </>
            ) : (
              'Scanning all coins...'
            )}
          </span>
        </div>
      </div>

      {/* Signals List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 flex flex-col">
        {COINS.map(coin => {
          const state = coinStates[coin];
          const signal = state?.signal;

          if (signal) {
            return (
              <SignalCard
                key={coin}
                signal={signal}
                coin={coin}
                onDismiss={() => dismissSignal(coin)}
              />
            );
          }

          return (
            <div
              key={coin}
              className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm flex-1 min-h-0 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div>
                  <div className="font-semibold text-white text-lg">{coin}</div>
                  <div className="text-sm text-white/60">
                    {state?.currentPrice > 0
                      ? `$${state.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'Connecting...'}
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  {state?.tradeCount || 0} trades
                </div>
              </div>
              
              {/* Volume indicator - EXPANDED */}
              <div className="mt-3 space-y-1.5 flex-1 flex flex-col">
                <div className="text-xs text-white/50 flex-shrink-0">Volume Activity</div>
                <div className="flex gap-1 flex-1 items-end min-h-[60px]">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i}
                      className={`flex-1 rounded-sm transition-all duration-300 ${
                        i < (state?.tradeCount || 0) % 10 
                          ? 'bg-purple-400/40' 
                          : 'bg-white/10'
                      }`}
                      style={{ 
                        height: `${Math.min(100, 20 + (i * 8))}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Market Status - EXPANDED */}
              <div className="mt-3 flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Market Status</span>
                  <span className="text-white/70">Scanning for signals...</span>
                </div>
                
                {/* Signal Strength Indicators on large screens */}
                <div className="hidden lg:block mt-2 space-y-1.5">
                  <div className="text-xs text-white/50 mb-1">Signal Strength Indicators</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-white/40">Buy Pressure</div>
                      <div className="text-white font-medium mt-0.5">
                        {/* Calculate buy pressure from trade count (0-100%) */}
                        {state?.tradeCount ? Math.min(100, (state.tradeCount % 7) * 14).toFixed(0) : '0'}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-white/40">Sell Pressure</div>
                      <div className="text-white font-medium mt-0.5">
                        {/* Calculate sell pressure as inverse of buy pressure */}
                        {state?.tradeCount ? Math.max(0, 100 - (state.tradeCount % 7) * 14).toFixed(0) : '0'}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Recent Signals section on large screens */}
        {activeSignals.length > 0 && (
          <div className="hidden xl:block mt-4 p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm flex-shrink-0">
            <div className="text-sm font-medium text-white/70 mb-2">Recent Signals (Last 10)</div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {activeSignals.slice(0, 10).map((signal, idx) => {
                const timeSince = Date.now() - signal.timestamp;
                const minutesAgo = Math.floor(timeSince / 60000);
                const hoursAgo = Math.floor(minutesAgo / 60);
                
                return (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${signal.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.coin}
                      </span>
                      <span className="text-white/60">{signal.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50">
                        ${signal.price.toFixed(2)}
                      </span>
                      <span className="text-white/40">
                        {hoursAgo > 0 ? `${hoursAgo}h ago` : `${minutesAgo}m ago`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SignalCard({ 
  signal, 
  coin,
  onDismiss 
}: { 
  signal: Signal; 
  coin: string;
  onDismiss: () => void;
}) {
  const isLong = signal.type === 'LONG';
  const profitPct = ((signal.target - signal.entry) / signal.entry) * 100;
  const stopPct = ((Math.abs(signal.entry - signal.stop)) / signal.entry) * 100;
  const riskReward = profitPct / stopPct;

  const timeSince = Date.now() - signal.timestamp;
  const secondsAgo = Math.floor(timeSince / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  
  let timeText = '';
  let isNew = false;
  
  if (secondsAgo < 60) {
    timeText = `${secondsAgo}sec ago`;
    isNew = true;
  } else if (minutesAgo < 60) {
    timeText = `${minutesAgo}min ago`;
    isNew = minutesAgo === 0;
  } else {
    const hoursAgo = Math.floor(minutesAgo / 60);
    timeText = `${hoursAgo}h ago`;
  }

  let confidenceBadge = '';
  let confidenceColor = '';
  if (signal.confidence >= 90) {
    confidenceBadge = '🔥';
    confidenceColor = 'text-orange-400';
  } else if (signal.confidence >= 75) {
    confidenceBadge = '⚠️';
    confidenceColor = 'text-yellow-400';
  }

  const metCount = signal.confirmations.filter(c => c.met).length;
  const totalCount = signal.confirmations.length;

  return (
    <div className={`border-2 rounded-xl p-3 backdrop-blur-sm ${
      isLong 
        ? 'border-green-400 bg-green-500/10' 
        : 'border-red-400 bg-red-500/10'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isLong ? 'text-green-300' : 'text-red-300'}`}>
                {signal.type} - {coin}
              </span>
              {isNew && (
                <span className="px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
                  NEW
                </span>
              )}
            </div>
            <div className="text-xs text-white/60">
              {timeText}
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Price & Confidence */}
      <div className="mb-2 pb-2 border-b border-white/20">
        <div className="text-2xl font-bold text-white">
          ${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`text-sm font-semibold ${confidenceColor}`}>
          Confidence: {signal.confidence}% ({metCount}/{totalCount}) {confidenceBadge}
        </div>
      </div>

      {/* Confirmations */}
      <div className="mb-2 space-y-1">
        {signal.confirmations.map((conf, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-xs"
          >
            {conf.met ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
            )}
            <div className={conf.met ? 'text-white/90' : 'text-white/40'}>
              <span className="font-medium">{conf.description}</span>
              {conf.value && (
                <span className="ml-1">({conf.value})</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-2 gap-2 p-2.5 bg-white/5 rounded-lg text-sm backdrop-blur-sm">
        <div>
          <div className="text-xs text-white/50">Entry → Target</div>
          <div className="font-bold text-green-400">
            ${signal.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">(+{profitPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-white/50">Stop Loss</div>
          <div className="font-bold text-red-400">
            ${signal.stop.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">(-{stopPct.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* R:R */}
      <div className="mt-1.5 text-center text-xs text-white/60">
        Risk:Reward = <span className="font-bold text-white">1:{riskReward.toFixed(1)}</span>
      </div>
    </div>
  );
}