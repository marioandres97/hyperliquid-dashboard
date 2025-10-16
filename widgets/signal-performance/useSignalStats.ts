import { useState, useEffect } from 'react';
import { SignalStats } from '../order-flow-signals/types';

const EMPTY_STATS: SignalStats = {
  totalSignals: 0,
  winRate: 0,
  avgPnL: 0,
  byStatus: {
    hit_target: 0,
    hit_stop: 0,
    expired: 0,
    dismissed: 0
  },
  byCoin: {}
};

export function useSignalStats() {
  const [stats, setStats] = useState<SignalStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/signals/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading };
}