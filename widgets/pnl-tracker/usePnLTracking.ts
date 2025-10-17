import { useState, useEffect } from 'react';
import { PnLStats } from '@/types/pnl';
import { getPnLEntries, calculatePnLStats } from '@/lib/pnl/calculator';

export function usePnLTracking() {
  const [stats, setStats] = useState<PnLStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Update every 5 seconds
    const interval = setInterval(loadStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    try {
      const entries = getPnLEntries();
      const calculatedStats = calculatePnLStats(entries);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load PnL stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, reload: loadStats };
}
