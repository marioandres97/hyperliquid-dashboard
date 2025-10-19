/**
 * Price monitoring service for alerts
 * Polls current prices and checks alert conditions
 */

import type { Alert, AlertCoin } from './types';
import { getPricesFromStorage, savePricesToStorage } from './localStorage';

export interface PriceData {
  BTC?: number;
  ETH?: number;
  HYPE?: number;
}

/**
 * Fetch current prices from Hyperliquid API
 * This is a simplified version - in production, you'd use the actual Hyperliquid SDK
 */
export async function fetchCurrentPrices(): Promise<PriceData> {
  try {
    // Try to get from localStorage first (cached)
    const cached = getPricesFromStorage();
    if (cached) {
      return {
        BTC: cached.BTC,
        ETH: cached.ETH,
        HYPE: cached.HYPE,
      };
    }

    // In a real implementation, this would call the Hyperliquid API
    // For now, we'll return mock data or fetch from a public API
    // You could use: https://api.hyperliquid.xyz/info
    
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'allMids',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }

    const data = await response.json();
    
    // Parse the response - format may vary
    const prices: PriceData = {
      BTC: data['BTC'] ? parseFloat(data['BTC']) : undefined,
      ETH: data['ETH'] ? parseFloat(data['ETH']) : undefined,
      HYPE: data['HYPE'] ? parseFloat(data['HYPE']) : undefined,
    };

    // Cache the prices
    savePricesToStorage(prices);

    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Fallback to cached prices even if expired
    const cached = getPricesFromStorage();
    if (cached) {
      return {
        BTC: cached.BTC,
        ETH: cached.ETH,
        HYPE: cached.HYPE,
      };
    }
    
    // Return empty if no cache available
    return {};
  }
}

/**
 * Check if a price alert should be triggered
 */
export function checkPriceAlert(alert: Alert, currentPrice: number): boolean {
  if (alert.type !== 'price') return false;
  if (!alert.enabled) return false;
  if (!alert.condition) return false;

  if (alert.condition === 'above') {
    return currentPrice >= alert.value;
  } else if (alert.condition === 'below') {
    return currentPrice <= alert.value;
  }

  return false;
}

/**
 * Check all alerts against current prices
 */
export async function checkAlerts(alerts: Alert[]): Promise<Alert[]> {
  const prices = await fetchCurrentPrices();
  const triggeredAlerts: Alert[] = [];

  for (const alert of alerts) {
    if (!alert.enabled) continue;

    if (alert.type === 'price' && alert.coin !== 'ALL') {
      const price = prices[alert.coin as keyof PriceData];
      if (price && checkPriceAlert(alert, price)) {
        triggeredAlerts.push(alert);
      }
    }
    
    // TODO: Implement large_order and volume alerts
    // These would require different data sources
  }

  return triggeredAlerts;
}

/**
 * Send browser notification for an alert
 */
export function sendNotification(alert: Alert, currentPrice?: number): void {
  if (!alert.browserNotif) return;
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;

  // Check permission
  if (Notification.permission !== 'granted') {
    return;
  }

  // Create notification message
  let message = '';
  if (alert.type === 'price' && currentPrice) {
    message = `${alert.coin} price ${alert.condition} $${alert.value.toLocaleString()}. Current: $${currentPrice.toLocaleString()}`;
  } else if (alert.type === 'large_order') {
    message = `${alert.coin} large order detected: ${alert.side} > $${alert.value.toLocaleString()}`;
  } else if (alert.type === 'volume') {
    message = `${alert.coin} volume spike > ${alert.value}%`;
  }

  // Show notification
  try {
    const notification = new Notification('Hyperliquid Alert', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: alert.id,
      requireInteraction: false,
      silent: false,
    });

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Optional: Handle click to focus the window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'denied';
  if (!('Notification' in window)) return 'denied';

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}
