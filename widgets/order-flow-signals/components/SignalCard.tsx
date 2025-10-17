import { TrendingUp, TrendingDown, Target, Shield, X, Clock } from 'lucide-react';
import { Signal } from '../types';
import { SignalConfirmations } from './SignalConfirmations';
import { SignalProgress } from './SignalProgress';

interface SignalCardProps {
  signal: Signal;
  coin: string;
  currentPrice: number;
  onDismiss: () => void;
  isNew: boolean;
}

export function SignalCard({ signal, coin, currentPrice, onDismiss, isNew }: SignalCardProps) {
  const isLong = signal.type === 'LONG';
  const timeAgo = Math.floor((Date.now() - signal.timestamp) / 60000);
  
  return (
    <div className={`
      relative rounded-3xl p-7
      bg-white/10 backdrop-blur-xl
      border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.1)]
      transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
      overflow-hidden
    `}>
      {/* Top border gradient */}
      <div className={`
        absolute top-0 left-0 right-0 h-1
        ${isLong ? 'bg-gradient-to-r from-green-400 to-cyan-400' : 'bg-gradient-to-r from-red-400 to-orange-400'}
      `} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center
            ${isLong ? 'bg-gradient-to-br from-green-400 to-cyan-400' : 'bg-gradient-to-br from-red-400 to-orange-400'}
          `}>
            {isLong ? (
              <TrendingUp className="w-4 h-4 text-white" />
            ) : (
              <TrendingDown className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <div className="text-sm opacity-70">{coin}</div>
            <div className="text-2xl font-bold">{signal.type}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isNew && (
            <div className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-400 to-red-500 animate-pulse">
              New
            </div>
          )}
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Entry Price */}
      <div className="mb-6">
        <div className="text-xs opacity-70 uppercase tracking-wider mb-2">Entry Price</div>
        <div className="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          ${signal.entry.toLocaleString()}
        </div>
      </div>

      {/* Progress */}
      <SignalProgress
        currentPrice={currentPrice}
        entry={signal.entry}
        target={signal.target}
        stop={signal.stop}
        type={signal.type}
      />

      {/* Targets */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-xs opacity-70 uppercase tracking-wider">Target</span>
          </div>
          <div className="text-xl font-semibold">${signal.target.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-1">
            +{(((signal.target - signal.entry) / signal.entry) * 100).toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-xs opacity-70 uppercase tracking-wider">Stop</span>
          </div>
          <div className="text-xl font-semibold">${signal.stop.toLocaleString()}</div>
          <div className="text-sm text-red-400 mt-1">
            -{(((signal.entry - signal.stop) / signal.entry) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div className="bg-white/5 rounded-2xl p-5 text-center mb-6">
        <div className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
          {signal.confidence}%
        </div>
        <div className="text-xs opacity-70 mt-2">
          Confidence Score • {signal.confirmations.length}/8 Confirmations
        </div>
      </div>

      {/* Confirmations */}
      <SignalConfirmations confirmations={signal.confirmations} />
      
      {/* Time */}
      <div className="flex items-center gap-2 text-xs opacity-50 mt-4">
        <Clock className="w-3 h-3" />
        <span>{timeAgo}m ago</span>
      </div>
    </div>
  );
}