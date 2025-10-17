'use client';

// Hook for managing alerts

import { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  AlertConfig,
  Coin,
  AbsorptionZone,
  LiquidationCascade,
  SupportResistanceLevel,
  DetectedPattern,
} from '../types';
import { getAlertManager } from '../services/alertManager';

export interface UseAlertsOptions {
  coin?: Coin;
  config?: Partial<AlertConfig>;
  enabled?: boolean;
}

export interface UseAlertsReturn {
  alerts: Alert[];
  unacknowledgedAlerts: Alert[];
  alertCount: number;
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAll: () => void;
  updateConfig: (config: Partial<AlertConfig>) => void;
  createAbsorptionAlert: (zone: AbsorptionZone, coin: Coin) => void;
  createCascadeAlert: (cascade: LiquidationCascade, coin: Coin) => void;
  createSRAlert: (level: SupportResistanceLevel, coin: Coin, eventType: 'touch' | 'breach') => void;
  createPatternAlert: (pattern: DetectedPattern, coin: Coin) => void;
}

/**
 * Hook for managing alerts
 */
export function useAlerts({
  coin,
  config,
  enabled = true,
}: UseAlertsOptions = {}): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertManager] = useState(() => getAlertManager(config));

  // Subscribe to new alerts
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = alertManager.subscribe((alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    // Load existing alerts
    const existing = coin 
      ? alertManager.getAlertsForCoin(coin)
      : alertManager.getActiveAlerts();
    setAlerts(existing);

    return unsubscribe;
  }, [alertManager, coin, enabled]);

  // Auto-clear expired alerts
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      alertManager.clearExpiredAlerts();
      const current = coin
        ? alertManager.getAlertsForCoin(coin)
        : alertManager.getActiveAlerts();
      setAlerts(current);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [alertManager, coin, enabled]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    alertManager.acknowledgeAlert(alertId);
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, [alertManager]);

  const acknowledgeAll = useCallback(() => {
    alertManager.acknowledgeAll();
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }, [alertManager]);

  const updateConfig = useCallback((newConfig: Partial<AlertConfig>) => {
    alertManager.updateConfig(newConfig);
  }, [alertManager]);

  const createAbsorptionAlert = useCallback((zone: AbsorptionZone, alertCoin: Coin) => {
    alertManager.createAbsorptionAlert(zone, alertCoin);
  }, [alertManager]);

  const createCascadeAlert = useCallback((cascade: LiquidationCascade, alertCoin: Coin) => {
    alertManager.createCascadeAlert(cascade, alertCoin);
  }, [alertManager]);

  const createSRAlert = useCallback(
    (level: SupportResistanceLevel, alertCoin: Coin, eventType: 'touch' | 'breach') => {
      alertManager.createSRAlert(level, alertCoin, eventType);
    },
    [alertManager]
  );

  const createPatternAlert = useCallback((pattern: DetectedPattern, alertCoin: Coin) => {
    alertManager.createPatternAlert(pattern, alertCoin);
  }, [alertManager]);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return {
    alerts,
    unacknowledgedAlerts,
    alertCount: unacknowledgedAlerts.length,
    acknowledgeAlert,
    acknowledgeAll,
    updateConfig,
    createAbsorptionAlert,
    createCascadeAlert,
    createSRAlert,
    createPatternAlert,
  };
}
