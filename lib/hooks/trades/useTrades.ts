import { useState, useEffect, useCallback } from 'react';

export interface Trade {
  id: string;
  coin: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradeInput {
  coin: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  entryTime: string;
  exitTime: string;
  notes?: string;
  tags?: string[];
}

export interface TradeFilters {
  coin?: string;
  side?: string;
  startDate?: string;
  endDate?: string;
}

export function useTrades(filters?: TradeFilters) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.coin) params.set('coin', filters.coin);
      if (filters?.side) params.set('side', filters.side);
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);

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
        // Use the detailed error message from the API
        const errorMsg = data.message || data.error || 'Failed to create trade';
        setError(errorMsg);
        
        // Include code and details if available for better debugging
        const detailedError = new Error(errorMsg);
        (detailedError as any).code = data.code;
        (detailedError as any).details = data.details;
        
        throw detailedError;
      }
    } catch (err) {
      // If it's a network error or fetch error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to reach the server. Please check your connection.');
        setError(networkError.message);
        console.error('Network error creating trade:', err);
        throw networkError;
      }
      
      // Re-throw the error with its message
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error creating trade:', err);
      throw err;
    }
  };

  const updateTrade = async (id: string, updates: Partial<CreateTradeInput>): Promise<boolean> => {
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

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Coin', 'Side', 'Entry', 'Exit', 'Size', 'PnL', 'PnL%', 'Notes', 'Tags'];
    const rows = trades.map(trade => {
      const entryDate = new Date(trade.entryTime);
      return [
        entryDate.toISOString().split('T')[0],
        entryDate.toISOString().split('T')[1].split('.')[0],
        trade.coin,
        trade.side,
        trade.entryPrice.toString(),
        trade.exitPrice.toString(),
        trade.size.toString(),
        trade.pnl.toFixed(2),
        trade.pnlPercent.toFixed(2),
        trade.notes || '',
        trade.tags.join(';')
      ].map(cell => `"${cell}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    trades,
    loading,
    error,
    createTrade,
    updateTrade,
    deleteTrade,
    exportToCSV,
    refetch: fetchTrades,
  };
}
