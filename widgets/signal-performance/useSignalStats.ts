import { useState, useEffect } from 'react';
import { SignalStats } from '@/types/signal-stats';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/signals/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
      // Keep previous stats on error, don't reset to empty
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, error };
}