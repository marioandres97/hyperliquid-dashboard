'use client';

import { useSignalDetection } from './useSignalDetection';
import { Signal } from './types';
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Wifi, WifiOff, X } from 'lucide-react';

const COINS = ['BTC', 'ETH', 'HYPE'];

export default function OrderFlowSignalsWidget() {
  const { coinStates, isConnected, dismissSignal } = useSignalDetection();

  // Obtener todas las señales activas ordenadas por timestamp (más reciente primero)
  const activeSignals = COINS
    .map(coin => coinStates[coin]?.signal ? { ...coinStates[coin].signal, coin } : null)
    .filter((s): s is Signal & { coin: string } => s !== null)
    .sort((a, b) => b.timestamp - a.timestamp);

  const activeCount = activeSignals.length;
  const anyConnected = Object.values(isConnected).some(c => c);

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {anyConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-700">
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
      <div className="flex-1 overflow-y-auto space-y-3">
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

          // Scanning state
          return (
            <div
              key={coin}
              className="p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">{coin}</div>
                  <div className="text-sm text-gray-500">
                    {state?.currentPrice > 0
                      ? `$${state.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'Connecting...'}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {state?.tradeCount || 0} trades
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">Scanning...</div>
            </div>
          );
        })}
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

  // Calcular tiempo desde la señal
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

  // Confidence badge
  let confidenceBadge = '';
  let confidenceColor = '';
  if (signal.confidence >= 90) {
    confidenceBadge = '🔥';
    confidenceColor = 'text-orange-600';
  } else if (signal.confidence >= 75) {
    confidenceBadge = '⚠️';
    confidenceColor = 'text-yellow-600';
  }

  const metCount = signal.confirmations.filter(c => c.met).length;
  const totalCount = signal.confirmations.length;

  return (
    <div className={`border-2 rounded-lg p-4 ${
      isLong ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="w-5 h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isLong ? 'text-green-700' : 'text-red-700'}`}>
                {signal.type} - {coin}
              </span>
              {isNew && (
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded">
                  NEW
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600">
              {timeText}
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Price & Confidence */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <div className="text-2xl font-bold text-gray-900">
          ${signal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`text-sm font-semibold ${confidenceColor}`}>
          Confidence: {signal.confidence}% ({metCount}/{totalCount}) {confidenceBadge}
        </div>
      </div>

      {/* Confirmations */}
      <div className="mb-3 space-y-1.5">
        {signal.confirmations.map((conf, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-xs"
          >
            {conf.met ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
            )}
            <div className={conf.met ? 'text-gray-700' : 'text-gray-400'}>
              <span className="font-medium">{conf.description}</span>
              {conf.value && (
                <span className="ml-1">({conf.value})</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg text-sm">
        <div>
          <div className="text-xs text-gray-500">Entry → Target</div>
          <div className="font-bold text-green-600">
            ${signal.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">(+{profitPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Stop Loss</div>
          <div className="font-bold text-red-600">
            ${signal.stop.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">(-{stopPct.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* R:R */}
      <div className="mt-2 text-center text-xs text-gray-600">
        Risk:Reward = <span className="font-bold">1:{riskReward.toFixed(1)}</span>
      </div>
    </div>
  );
}