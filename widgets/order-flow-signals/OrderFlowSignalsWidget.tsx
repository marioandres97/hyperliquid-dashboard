'use client';

import { useState } from 'react';
import { useSignalDetection } from './useSignalDetection';
import { Signal } from './types';
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Wifi, WifiOff } from 'lucide-react';

const COINS = ['BTC', 'ETH', 'HYPE'];

export default function OrderFlowSignalsWidget() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const { signal, isConnected, currentPrice, tradeCount, dismissSignal } = useSignalDetection(selectedCoin);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-gray-500">
            {tradeCount} trades processed
          </span>
        </div>

        {/* Coin selector */}
        <div className="flex gap-2">
          {COINS.map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedCoin === coin
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {coin}
            </button>
          ))}
        </div>
      </div>

      {/* Current Price */}
      <div className="text-center">
        <div className="text-sm text-gray-500">Current Price</div>
        <div className="text-2xl font-bold">
          ${currentPrice > 0 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
        </div>
      </div>

      {/* Signal Display */}
      {signal ? (
        <SignalCard signal={signal} onDismiss={dismissSignal} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-center">
          <div>
            <div className="text-lg font-medium mb-2">Scanning for signals...</div>
            <div className="text-sm">High quality signals will appear here</div>
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, onDismiss }: { signal: Signal; onDismiss: () => void }) {
  const isLong = signal.type === 'LONG';
  const profitPct = ((signal.target - signal.entry) / signal.entry) * 100;
  const stopPct = ((signal.entry - signal.stop) / signal.entry) * 100;

  return (
    <div className={`flex-1 border-2 rounded-lg p-4 ${
      isLong ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="w-6 h-6 text-green-600" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-600" />
          )}
          <div>
            <div className={`text-xl font-bold ${isLong ? 'text-green-700' : 'text-red-700'}`}>
              {signal.type} SIGNAL - {signal.coin}
            </div>
            <div className="text-sm text-gray-600">
              Confidence: {signal.confidence}%
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmations */}
      <div className="mb-4 space-y-2">
        <div className="text-sm font-semibold text-gray-700">
          Confirmations: {signal.confirmations.filter(c => c.met).length}/{signal.confirmations.length}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {signal.confirmations.map((conf, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 text-xs p-2 rounded ${
                conf.met ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              {conf.met ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-medium">{conf.description}</div>
                {conf.value && (
                  <div className="text-gray-600">{conf.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg">
        <div>
          <div className="text-xs text-gray-500 mb-1">Entry</div>
          <div className="font-bold text-gray-900">
            ${signal.entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Target</div>
          <div className="font-bold text-green-600">
            ${signal.target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">(+{profitPct.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Stop</div>
          <div className="font-bold text-red-600">
            ${signal.stop.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs ml-1">(-{stopPct.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* R:R Ratio */}
      <div className="mt-3 text-center text-sm">
        <span className="text-gray-600">Risk:Reward = </span>
        <span className="font-bold text-gray-900">1:{(profitPct / stopPct).toFixed(1)}</span>
      </div>

      {/* Reasoning */}
      <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
        {signal.reasoning}
      </div>
    </div>
  );
}