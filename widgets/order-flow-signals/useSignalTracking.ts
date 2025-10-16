import { useEffect, useRef } from 'react';
import { Signal } from './types';

interface SignalTrackingProps {
  signals: Record<string, Signal | null>;
  currentPrices: Record<string, number>;
  onSignalResolved: (coin: string) => void; // Nueva prop
}

export function useSignalTracking({ signals, currentPrices, onSignalResolved }: SignalTrackingProps) {
  const trackedSignals = useRef<Set<string>>(new Set());

  useEffect(() => {
    Object.entries(signals).forEach(([coin, signal]) => {
      if (!signal) return;

      const currentPrice = currentPrices[coin];
      if (!currentPrice) return;

      if (trackedSignals.current.has(signal.id)) return;

      // Verificar si tocó target
      if (
        (signal.type === 'LONG' && currentPrice >= signal.target) ||
        (signal.type === 'SHORT' && currentPrice <= signal.target)
      ) {
        updateSignalStatus(signal.id, 'hit_target', currentPrice, () => {
          onSignalResolved(coin);
        });
        trackedSignals.current.add(signal.id);
        return;
      }

      // Verificar si tocó stop
      if (
        (signal.type === 'LONG' && currentPrice <= signal.stop) ||
        (signal.type === 'SHORT' && currentPrice >= signal.stop)
      ) {
        updateSignalStatus(signal.id, 'hit_stop', currentPrice, () => {
          onSignalResolved(coin);
        });
        trackedSignals.current.add(signal.id);
        return;
      }
    });
  }, [signals, currentPrices, onSignalResolved]);
}

async function updateSignalStatus(
  id: string,
  status: 'hit_target' | 'hit_stop',
  exitPrice: number,
  onComplete: () => void
) {
  try {
    const response = await fetch(`/api/signals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        exitPrice,
        exitTimestamp: Date.now()
      })
    });
    
    if (response.ok) {
      console.log(`Signal ${id} updated: ${status} at ${exitPrice}`);
      // Solo limpiar UI si se guardó exitosamente
      onComplete();
    }
  } catch (error) {
    console.error('Failed to update signal:', error);
  }
}