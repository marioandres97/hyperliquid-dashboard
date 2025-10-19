/**
 * Hook for monitoring alerts and triggering notifications
 */

import { useEffect, useRef, useCallback } from 'react';
import type { Alert } from '@/lib/alerts/types';
import { checkAlerts, sendNotification, fetchCurrentPrices } from '@/lib/alerts/priceMonitor';
import { updateAlertInStorage } from '@/lib/alerts/localStorage';

interface UseAlertMonitoringProps {
  alerts: Alert[];
  onAlertTriggered?: (alert: Alert) => void;
  enabled?: boolean;
}

/**
 * Monitor alerts and send notifications when conditions are met
 */
export function useAlertMonitoring({
  alerts,
  onAlertTriggered,
  enabled = true,
}: UseAlertMonitoringProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  const checkAndNotify = useCallback(async () => {
    if (!enabled || alerts.length === 0) return;

    try {
      // Get enabled alerts only
      const enabledAlerts = alerts.filter(a => a.enabled);
      if (enabledAlerts.length === 0) return;

      // Check alerts
      const triggered = await checkAlerts(enabledAlerts);

      // Get current prices for notifications
      const prices = await fetchCurrentPrices();

      // Process triggered alerts
      for (const alert of triggered) {
        // Skip if already triggered in this session (prevent spam)
        if (triggeredAlertsRef.current.has(alert.id)) {
          continue;
        }

        // Mark as triggered
        triggeredAlertsRef.current.add(alert.id);

        // Get current price for notification
        const currentPrice = alert.coin !== 'ALL' && alert.type === 'price'
          ? prices[alert.coin as keyof typeof prices]
          : undefined;

        // Send notification
        sendNotification(alert, currentPrice);

        // Update localStorage
        updateAlertInStorage(alert.id, {
          triggered: alert.triggered + 1,
          lastTriggered: new Date(),
        });

        // Call callback
        if (onAlertTriggered) {
          onAlertTriggered(alert);
        }

        // Reset triggered state after 5 minutes to allow re-triggering
        setTimeout(() => {
          triggeredAlertsRef.current.delete(alert.id);
        }, 5 * 60 * 1000);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }, [alerts, enabled, onAlertTriggered]);

  // Set up interval to check alerts every 5 seconds
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount
    checkAndNotify();

    // Then check every 5 seconds
    intervalRef.current = setInterval(() => {
      checkAndNotify();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkAndNotify, enabled]);

  return {
    checkNow: checkAndNotify,
  };
}
