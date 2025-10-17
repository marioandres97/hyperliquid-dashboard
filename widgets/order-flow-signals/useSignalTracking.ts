import { useEffect, useRef } from 'react';
import { Signal, TrackedSignal, SCALPING_CONFIG } from './types';
import { calculatePnL, savePnLEntry } from '@/lib/pnl/calculator';
import { PnLEntry } from '@/types/pnl';

interface SignalTrackingProps {
  signals: Record<string, Signal | null>;
  currentPrices: Record<string, number>;
  onSignalResolved: (coin: string) => void;
}

export function useSignalTracking({ signals, currentPrices, onSignalResolved }: SignalTrackingProps) {
  const trackedSignals = useRef<Map<string, TrackedSignal>>(new Map());
  const processedSignals = useRef<Set<string>>(new Set());

  useEffect(() => {
    Object.entries(signals).forEach(([coin, signal]) => {
      if (!signal) return;

      const currentPrice = currentPrices[coin];
      if (!currentPrice) return;

      // Skip if already processed (hit target or stop)
      if (processedSignals.current.has(signal.id)) return;

      // Get or create tracked signal
      let tracked = trackedSignals.current.get(signal.id);
      if (!tracked) {
        tracked = {
          ...signal,
          status: 'active',
          movedToBreakEven: false,
          partialsClosed: {}
        } as TrackedSignal;
        trackedSignals.current.set(signal.id, tracked);
      }

      // Calculate current profit
      const profit = calculateCurrentProfit(signal, currentPrice);

      // 1. Check break-even
      const beLevel = SCALPING_CONFIG.breakEven[coin as keyof typeof SCALPING_CONFIG.breakEven] || 0.03;
      if (profit >= beLevel && !tracked.movedToBreakEven) {
        tracked.stop = signal.entry;
        tracked.movedToBreakEven = true;
        console.log(`${coin} moved to break-even at ${currentPrice}`);
      }

      // 2. Check trailing stop
      if (SCALPING_CONFIG.trailingStop.enabled && profit > 0) {
        const trailingDistance = SCALPING_CONFIG.trailingStop.distance[coin as keyof typeof SCALPING_CONFIG.trailingStop.distance] || 0.02;
        const newStop = calculateTrailingStop(currentPrice, signal.type, trailingDistance);
        
        if (signal.type === 'LONG' && newStop > tracked.stop) {
          tracked.stop = newStop;
          tracked.trailingStopPrice = newStop;
        } else if (signal.type === 'SHORT' && newStop < tracked.stop) {
          tracked.stop = newStop;
          tracked.trailingStopPrice = newStop;
        }
      }

      // 3. Check partial take profits
      if (SCALPING_CONFIG.partialTakeProfit.enabled) {
        SCALPING_CONFIG.partialTakeProfit.levels.forEach(level => {
          if (profit >= level.atProfit && !tracked.partialsClosed![level.percent]) {
            tracked.partialsClosed![level.percent] = true;
            recordPartialTP(signal, level.percent, currentPrice, level.atProfit);
            console.log(`${coin} partial TP: ${level.percent}% at ${currentPrice}`);
          }
        });
      }

      // 4. Check final exit - TARGET
      if (
        (signal.type === 'LONG' && currentPrice >= signal.target) ||
        (signal.type === 'SHORT' && currentPrice <= signal.target)
      ) {
        recordPnL(signal, currentPrice, 'target');
        updateSignalStatus(signal, 'hit_target', currentPrice, () => {
          onSignalResolved(coin);
        });
        processedSignals.current.add(signal.id);
        trackedSignals.current.delete(signal.id);
        return;
      }

      // 5. Check final exit - STOP (including trailing stop)
      if (
        (signal.type === 'LONG' && currentPrice <= tracked.stop) ||
        (signal.type === 'SHORT' && currentPrice >= tracked.stop)
      ) {
        const exitReason = tracked.trailingStopPrice ? 'trailing_stop' : 
                          tracked.movedToBreakEven ? 'break_even' : 'stop';
        recordPnL(signal, currentPrice, exitReason);
        updateSignalStatus(signal, 'hit_stop', currentPrice, () => {
          onSignalResolved(coin);
        });
        processedSignals.current.add(signal.id);
        trackedSignals.current.delete(signal.id);
        return;
      }
    });
  }, [signals, currentPrices, onSignalResolved]);
}

function calculateCurrentProfit(signal: Signal, currentPrice: number): number {
  if (signal.type === 'LONG') {
    return ((currentPrice - signal.entry) / signal.entry) * 100;
  } else {
    return ((signal.entry - currentPrice) / signal.entry) * 100;
  }
}

function calculateTrailingStop(currentPrice: number, type: 'LONG' | 'SHORT', distance: number): number {
  if (type === 'LONG') {
    return currentPrice * (1 - distance / 100);
  } else {
    return currentPrice * (1 + distance / 100);
  }
}

function recordPartialTP(signal: Signal, percent: number, exitPrice: number, profitPercent: number) {
  const { pnlPercent, pnlUsd } = calculatePnL(signal.entry, exitPrice, signal.type, percent);
  
  const entry: PnLEntry = {
    id: `${signal.id}-partial-${percent}`,
    signalId: signal.id,
    coin: signal.coin,
    type: signal.type,
    entryPrice: signal.entry,
    exitPrice,
    exitReason: 'partial_tp',
    pnlPercent,
    pnlUsd,
    timestamp: Date.now(),
    duration: Date.now() - signal.timestamp,
    partialClose: {
      percent,
      price: exitPrice
    }
  };
  
  savePnLEntry(entry);
}

function recordPnL(signal: Signal, exitPrice: number, exitReason: 'target' | 'stop' | 'trailing_stop' | 'break_even') {
  const { pnlPercent, pnlUsd } = calculatePnL(signal.entry, exitPrice, signal.type);
  
  const entry: PnLEntry = {
    id: signal.id,
    signalId: signal.id,
    coin: signal.coin,
    type: signal.type,
    entryPrice: signal.entry,
    exitPrice,
    exitReason,
    pnlPercent,
    pnlUsd,
    timestamp: Date.now(),
    duration: Date.now() - signal.timestamp
  };
  
  savePnLEntry(entry);
}

async function updateSignalStatus(
  signal: Signal,
  status: 'hit_target' | 'hit_stop',
  exitPrice: number,
  onComplete: () => void
) {
  try {
    const response = await fetch(`/api/signals/${signal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...signal,
        status,
        exitPrice,
        exitTimestamp: Date.now()
      })
    });
    
    if (response.ok) {
      console.log(`Signal ${signal.id} updated: ${status} at ${exitPrice}`);
      onComplete();
    }
  } catch (error) {
    console.error('Failed to update signal:', error);
  }
}