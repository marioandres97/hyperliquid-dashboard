import { useState, useEffect, useCallback } from 'react';
import { WhaleTradeCategory } from '@/lib/database/repositories/whaleTrade.repository';

export interface WhaleTrade {
  id: string;
  asset: string;
  side: string;
  price: number;
  size: number;
  notionalValue: number;
  category: WhaleTradeCategory;
  exchange: string;
  tradeId?: string;
  timestamp: string;
  priceImpact?: number;
  metadata?: any;
  createdAt: string;
}

export interface WhaleTradeFilters {
  asset?: string;
  category?: WhaleTradeCategory;
  side?: 'BUY' | 'SELL';
  minNotionalValue?: number;
  maxNotionalValue?: number;
  startDate?: Date;
  endDate?: Date;
  hours?: number;
  limit?: number;
  skip?: number;
}

export interface WhaleTradeStats {
  totalTrades: number;
  totalVolume: number;
  avgTradeSize: number;
  buyCount: number;
  sellCount: number;
  byCategory: Record<WhaleTradeCategory, number>;
  byAsset: Record<string, number>;
}

export interface ThresholdInfo {
  assetThresholds: Record<string, number>;
  categoryThresholds: Record<string, number>;
  categories: WhaleTradeCategory[];
}

export interface TrackTradeInput {
  asset: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  timestamp?: Date;
  tradeId?: string;
  priceImpact?: number;
  metadata?: any;
}

export interface TrackTradeResult {
  isWhaleTrade: boolean;
  category?: WhaleTradeCategory;
  notionalValue: number;
  threshold: number;
  stored: boolean;
  tradeId?: string;
}

/**
 * Hook for managing whale trades
 */
export function useWhaleTrades(filters?: WhaleTradeFilters) {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WhaleTradeStats | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdInfo | null>(null);

  /**
   * Fetch whale trades with current filters
   */
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (filters?.asset) params.set('asset', filters.asset);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.side) params.set('side', filters.side);
      if (filters?.minNotionalValue !== undefined) {
        params.set('minNotionalValue', filters.minNotionalValue.toString());
      }
      if (filters?.maxNotionalValue !== undefined) {
        params.set('maxNotionalValue', filters.maxNotionalValue.toString());
      }
      if (filters?.startDate) {
        params.set('startDate', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        params.set('endDate', filters.endDate.toISOString());
      }
      if (filters?.hours !== undefined) {
        params.set('hours', filters.hours.toString());
      }
      if (filters?.limit !== undefined) {
        params.set('limit', filters.limit.toString());
      }
      if (filters?.skip !== undefined) {
        params.set('skip', filters.skip.toString());
      }

      const response = await fetch(`/api/whale-trades?${params}`);
      const data = await response.json();

      if (data.success) {
        setTrades(data.data);
      } else {
        setError(data.error || 'Failed to fetch whale trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching whale trades:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch whale trade statistics
   */
  const fetchStats = useCallback(async (statsFilters?: WhaleTradeFilters) => {
    try {
      const params = new URLSearchParams({ stats: 'true' });
      
      if (statsFilters?.asset) params.set('asset', statsFilters.asset);
      if (statsFilters?.startDate) {
        params.set('startDate', statsFilters.startDate.toISOString());
      }
      if (statsFilters?.endDate) {
        params.set('endDate', statsFilters.endDate.toISOString());
      }

      const response = await fetch(`/api/whale-trades?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Failed to fetch whale trade stats:', data.error);
      }
    } catch (err) {
      console.error('Error fetching whale trade stats:', err);
    }
  }, []);

  /**
   * Fetch threshold information
   */
  const fetchThresholds = useCallback(async () => {
    try {
      const response = await fetch('/api/whale-trades?thresholds=true');
      const data = await response.json();

      if (data.success) {
        setThresholds(data.data);
      } else {
        console.error('Failed to fetch thresholds:', data.error);
      }
    } catch (err) {
      console.error('Error fetching thresholds:', err);
    }
  }, []);

  /**
   * Track a new trade
   */
  const trackTrade = async (input: TrackTradeInput): Promise<TrackTradeResult | null> => {
    try {
      const response = await fetch('/api/whale-trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh trades list if the trade was stored
        if (data.data.stored) {
          await fetchTrades();
        }
        return data.data;
      } else {
        // Not a whale trade or failed to store
        if (data.data) {
          return data.data;
        }
        setError(data.error || 'Failed to track trade');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error tracking trade:', err);
      return null;
    }
  };

  /**
   * Get recent whale trades
   */
  const getRecent = async (hours: number = 24, limit: number = 100) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        hours: hours.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/whale-trades?${params}`);
      const data = await response.json();

      if (data.success) {
        setTrades(data.data);
      } else {
        setError(data.error || 'Failed to fetch recent whale trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching recent whale trades:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return {
    trades,
    loading,
    error,
    stats,
    thresholds,
    fetchTrades,
    fetchStats,
    fetchThresholds,
    trackTrade,
    getRecent,
    refetch: fetchTrades,
  };
}

/**
 * Hook for whale trade statistics only
 */
export function useWhaleTradeStats(filters?: WhaleTradeFilters) {
  const [stats, setStats] = useState<WhaleTradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ stats: 'true' });
      
      if (filters?.asset) params.set('asset', filters.asset);
      if (filters?.startDate) {
        params.set('startDate', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        params.set('endDate', filters.endDate.toISOString());
      }

      const response = await fetch(`/api/whale-trades?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to fetch whale trade stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching whale trade stats:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

/**
 * Hook for threshold information
 */
export function useWhaleThresholds() {
  const [thresholds, setThresholds] = useState<ThresholdInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThresholds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/whale-trades?thresholds=true');
      const data = await response.json();

      if (data.success) {
        setThresholds(data.data);
      } else {
        setError(data.error || 'Failed to fetch thresholds');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching thresholds:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  return {
    thresholds,
    loading,
    error,
    refetch: fetchThresholds,
  };
}
