import { useState, useEffect, useCallback } from 'react';
import { Trade, CreateTradeInput, UpdateTradeInput, TradeFilters } from '@/types/pnl-tracker';

export function useTrades(filters?: TradeFilters) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.asset) params.set('asset', filters.asset);
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters?.baseAsset) params.set('baseAsset', filters.baseAsset);

      const response = await fetch(`/api/trades?${params}`);
      const data = await response.json();

      if (data.success) {
        setTrades(data.data);
      } else {
        setError(data.error || 'Failed to fetch trades');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const createTrade = async (input: CreateTradeInput): Promise<Trade | null> => {
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTrades();
        setError(null);
        return data.data;
      } else {
        const errorMsg = data.message || data.error || 'Failed to create trade';
        setError(errorMsg);
        
        const detailedError = new Error(errorMsg);
        (detailedError as any).code = data.code;
        (detailedError as any).details = data.details;
        
        throw detailedError;
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to reach the server. Please check your connection.');
        setError(networkError.message);
        console.error('Network error creating trade:', err);
        throw networkError;
      }
      
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error creating trade:', err);
      throw err;
    }
  };

  const updateTrade = async (id: string, updates: UpdateTradeInput): Promise<boolean> => {
    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        await fetchTrades();
        return true;
      } else {
        setError(data.error || 'Failed to update trade');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error updating trade:', err);
      return false;
    }
  };

  const deleteTrade = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchTrades();
        return true;
      } else {
        setError(data.error || 'Failed to delete trade');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error deleting trade:', err);
      return false;
    }
  };

  return {
    trades,
    loading,
    error,
    createTrade,
    updateTrade,
    deleteTrade,
    refetch: fetchTrades,
  };
}
