'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import type { Alert, CreateAlertInput, UpdateAlertInput } from '@/types/alerts';

interface AlertsResponse {
  success: boolean;
  data: Alert[];
  count: number;
}

interface AlertResponse {
  success: boolean;
  data: Alert;
  message?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAlerts(filter?: { active?: boolean; triggered?: boolean }) {
  const queryParams = new URLSearchParams();
  if (filter?.active !== undefined) queryParams.set('active', filter.active.toString());
  if (filter?.triggered !== undefined) queryParams.set('triggered', filter.triggered.toString());
  
  const url = `/api/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data, error, isLoading, mutate: refetch } = useSWR<AlertsResponse>(
    url,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const createAlert = useCallback(async (input: CreateAlertInput): Promise<Alert | null> => {
    setCreating(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result: AlertResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create alert');
      }

      // Show success toast
      if (result.message) {
        // You could integrate with a toast library here
        console.log(result.message);
      }

      // Refresh the alerts list
      await refetch();
      await mutate('/api/alerts');

      return result.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [refetch]);

  const updateAlert = useCallback(async (id: string, input: UpdateAlertInput): Promise<Alert | null> => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result: AlertResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update alert');
      }

      if (result.message) {
        console.log(result.message);
      }

      // Refresh the alerts list
      await refetch();
      await mutate('/api/alerts');

      return result.data;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [refetch]);

  const deleteAlert = useCallback(async (id: string): Promise<void> => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete alert');
      }

      if (result.message) {
        console.log(result.message);
      }

      // Refresh the alerts list
      await refetch();
      await mutate('/api/alerts');
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    } finally {
      setDeleting(false);
    }
  }, [refetch]);

  return {
    alerts: data?.data || [],
    count: data?.count || 0,
    isLoading,
    error: error ? 'Failed to load alerts' : null,
    creating,
    updating,
    deleting,
    createAlert,
    updateAlert,
    deleteAlert,
    refetch,
  };
}
