'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import type { NotificationSettings, NotificationSettingsInput } from '@/types/alerts';

interface SettingsResponse {
  success: boolean;
  data: NotificationSettings;
  message?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotificationSettings() {
  const { data, error, isLoading, mutate: refetch } = useSWR<SettingsResponse>(
    '/api/notifications/settings',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const [updating, setUpdating] = useState(false);

  const updateSettings = useCallback(async (input: NotificationSettingsInput): Promise<NotificationSettings | null> => {
    setUpdating(true);
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result: SettingsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update settings');
      }

      if (result.message) {
        console.log(result.message);
      }

      // Refresh the settings
      await refetch();

      return result.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [refetch]);

  return {
    settings: data?.data || null,
    isLoading,
    error: error ? 'Failed to load settings' : null,
    updating,
    updateSettings,
    refetch,
  };
}
