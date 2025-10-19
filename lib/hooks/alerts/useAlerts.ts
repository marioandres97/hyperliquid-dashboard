'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Alert, AlertHistory, CreateAlertInput, UpdateAlertInput } from '@/lib/alerts/types';

interface UseAlertsResult {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  createAlert: (input: CreateAlertInput) => Promise<Alert | null>;
  updateAlert: (id: string, input: UpdateAlertInput) => Promise<Alert | null>;
  deleteAlert: (id: string) => Promise<boolean>;
  refetch: () => void;
}

export function useAlerts(): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Import localStorage utilities dynamically (client-side only)
      const { getAlertsFromStorage, saveAlertsToStorage } = await import('@/lib/alerts/localStorage');

      // Try to fetch from API first
      try {
        const response = await fetch('/api/alerts');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            // Parse dates
            const parsedAlerts = data.data.map((alert: any) => ({
              ...alert,
              createdAt: new Date(alert.createdAt),
              updatedAt: new Date(alert.updatedAt),
              lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : null,
            }));
            
            // Save to localStorage as backup
            saveAlertsToStorage(parsedAlerts);
            setAlerts(parsedAlerts);
            return;
          }
        }
      } catch (apiError) {
        console.warn('API not available, using localStorage:', apiError);
      }

      // Fallback to localStorage
      const localAlerts = getAlertsFromStorage();
      setAlerts(localAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = useCallback(async (input: CreateAlertInput): Promise<Alert | null> => {
    try {
      const { addAlertToStorage } = await import('@/lib/alerts/localStorage');

      // Try API first
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (data.success) {
          const newAlert = {
            ...data.data,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
            lastTriggered: data.data.lastTriggered ? new Date(data.data.lastTriggered) : null,
          };
          
          // Save to localStorage too
          addAlertToStorage(newAlert);
          setAlerts((prev) => [newAlert, ...prev]);
          return newAlert;
        }
      } catch (apiError) {
        console.warn('API not available, saving to localStorage only:', apiError);
      }

      // Fallback: create alert in localStorage only
      const newAlert: Alert = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: null,
        type: input.type,
        coin: input.coin,
        condition: input.condition || null,
        value: input.value,
        side: input.side || null,
        enabled: true,
        browserNotif: input.browserNotif ?? true,
        emailNotif: input.emailNotif ?? false,
        webhook: input.webhook || null,
        triggered: 0,
        lastTriggered: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addAlertToStorage(newAlert);
      setAlerts((prev) => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Error creating alert:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateAlert = useCallback(async (id: string, input: UpdateAlertInput): Promise<Alert | null> => {
    try {
      const { updateAlertInStorage } = await import('@/lib/alerts/localStorage');

      // Try API first
      try {
        const response = await fetch(`/api/alerts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (data.success) {
          const updatedAlert = {
            ...data.data,
            createdAt: new Date(data.data.createdAt),
            updatedAt: new Date(data.data.updatedAt),
            lastTriggered: data.data.lastTriggered ? new Date(data.data.lastTriggered) : null,
          };
          
          // Update localStorage too
          updateAlertInStorage(id, updatedAlert);
          setAlerts((prev) =>
            prev.map((alert) => (alert.id === id ? updatedAlert : alert))
          );
          return updatedAlert;
        }
      } catch (apiError) {
        console.warn('API not available, updating localStorage only:', apiError);
      }

      // Fallback: update in localStorage
      setAlerts((prev) => {
        const updated = prev.map((alert) => {
          if (alert.id === id) {
            const updatedAlert = { ...alert, ...input, updatedAt: new Date() };
            updateAlertInStorage(id, updatedAlert);
            return updatedAlert;
          }
          return alert;
        });
        return updated;
      });

      const updatedAlert = alerts.find(a => a.id === id);
      return updatedAlert || null;
    } catch (err) {
      console.error('Error updating alert:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [alerts]);

  const deleteAlert = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { deleteAlertFromStorage } = await import('@/lib/alerts/localStorage');

      // Try API first
      try {
        const response = await fetch(`/api/alerts/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          deleteAlertFromStorage(id);
          setAlerts((prev) => prev.filter((alert) => alert.id !== id));
          return true;
        }
      } catch (apiError) {
        console.warn('API not available, deleting from localStorage only:', apiError);
      }

      // Fallback: delete from localStorage
      deleteAlertFromStorage(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    refetch: fetchAlerts,
  };
}

interface UseAlertHistoryResult {
  history: AlertHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAlertHistory(alertId?: string): UseAlertHistoryResult {
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (alertId) params.append('alertId', alertId);

      const response = await fetch(`/api/alerts/history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alert history');
      }

      const data = await response.json();
      
      if (data.success) {
        // Parse dates
        const parsedHistory = data.data.map((item: any) => ({
          ...item,
          triggeredAt: new Date(item.triggeredAt),
        }));
        setHistory(parsedHistory);
      } else {
        throw new Error(data.error || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching alert history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
}
