/**
 * LocalStorage utilities for alerts
 * Provides offline storage and fallback when API is unavailable
 */

import type { Alert, CreateAlertInput } from './types';

const STORAGE_KEY = 'hyperliquid_alerts';
const PRICES_KEY = 'hyperliquid_prices';

export interface StoredAlert extends Omit<Alert, 'createdAt' | 'updatedAt' | 'lastTriggered'> {
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string | null;
}

/**
 * Get all alerts from localStorage
 */
export function getAlertsFromStorage(): Alert[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const alerts: StoredAlert[] = JSON.parse(stored);
    return alerts.map(alert => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      updatedAt: new Date(alert.updatedAt),
      lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : null,
    }));
  } catch (error) {
    console.error('Error reading alerts from localStorage:', error);
    return [];
  }
}

/**
 * Save alerts to localStorage
 */
export function saveAlertsToStorage(alerts: Alert[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const storedAlerts: StoredAlert[] = alerts.map(alert => ({
      ...alert,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
      lastTriggered: alert.lastTriggered ? alert.lastTriggered.toISOString() : null,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAlerts));
  } catch (error) {
    console.error('Error saving alerts to localStorage:', error);
  }
}

/**
 * Add alert to localStorage
 */
export function addAlertToStorage(alert: Alert): void {
  const alerts = getAlertsFromStorage();
  alerts.push(alert);
  saveAlertsToStorage(alerts);
}

/**
 * Update alert in localStorage
 */
export function updateAlertInStorage(id: string, updates: Partial<Alert>): void {
  const alerts = getAlertsFromStorage();
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts[index] = {
      ...alerts[index],
      ...updates,
      updatedAt: new Date(),
    };
    saveAlertsToStorage(alerts);
  }
}

/**
 * Delete alert from localStorage
 */
export function deleteAlertFromStorage(id: string): void {
  const alerts = getAlertsFromStorage();
  const filtered = alerts.filter(a => a.id !== id);
  saveAlertsToStorage(filtered);
}

/**
 * Store current prices for monitoring
 */
export interface StoredPrices {
  BTC?: number;
  ETH?: number;
  HYPE?: number;
  timestamp: number;
}

export function savePricesToStorage(prices: Omit<StoredPrices, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data: StoredPrices = {
      ...prices,
      timestamp: Date.now(),
    };
    localStorage.setItem(PRICES_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving prices to localStorage:', error);
  }
}

export function getPricesFromStorage(): StoredPrices | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(PRICES_KEY);
    if (!stored) return null;
    
    const prices: StoredPrices = JSON.parse(stored);
    
    // Return null if prices are older than 5 minutes
    if (Date.now() - prices.timestamp > 5 * 60 * 1000) {
      return null;
    }
    
    return prices;
  } catch (error) {
    console.error('Error reading prices from localStorage:', error);
    return null;
  }
}

/**
 * Clear all alert data from localStorage
 */
export function clearAlertStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PRICES_KEY);
  } catch (error) {
    console.error('Error clearing alert storage:', error);
  }
}
