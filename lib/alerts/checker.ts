/**
 * Alert Checker
 * Background job that checks all active alerts and triggers notifications
 * Server-side only
 */

import { prisma } from '@/lib/database/client';
import { checkAlertCondition, handleTriggeredAlert } from './trigger-handler';
import type { Alert } from '@/types/alerts';

/**
 * Get current price for an asset pair from Hyperliquid
 */
async function getCurrentPrice(asset: string, baseAsset: string = 'USDT'): Promise<number | null> {
  try {
    // For now, we'll use the Hyperliquid API directly
    // In production, this should use the same price feed as the dashboard
    
    // If baseAsset is not USDT/USDC/USD, we'd need to do conversion
    // For simplicity, treating all USD stablecoins the same
    if (baseAsset !== 'USDT' && baseAsset !== 'USDC' && baseAsset !== 'USD') {
      // For BTC/ETH base pairs, we'd need cross rates
      // This is a simplified implementation
      console.warn(`Base asset ${baseAsset} conversion not fully implemented`);
      return null;
    }

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
      console.error('Failed to fetch prices from Hyperliquid');
      return null;
    }

    const data = await response.json();
    
    // The response is an object with asset symbols as keys
    // Try common variations of the asset symbol
    const possibleKeys = [
      asset,
      `${asset}-USD`,
      `${asset}USD`,
      `${asset}/USD`,
    ];

    for (const key of possibleKeys) {
      if (data[key]) {
        return parseFloat(data[key]);
      }
    }

    console.warn(`Price not found for ${asset}`);
    return null;
  } catch (error) {
    console.error('Error fetching current price:', error);
    return null;
  }
}

/**
 * Get current prices for multiple asset pairs
 */
async function getCurrentPrices(pairs: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  try {
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
      console.error('Failed to fetch prices from Hyperliquid');
      return prices;
    }

    const data = await response.json();

    // Map each pair to its price
    for (const pair of pairs) {
      const [asset, baseAsset] = pair.split('/');
      
      // For simplicity, treating all USD stablecoins the same
      if (baseAsset !== 'USDT' && baseAsset !== 'USDC' && baseAsset !== 'USD') {
        continue;
      }

      // Try common variations
      const possibleKeys = [
        asset,
        `${asset}-USD`,
        `${asset}USD`,
        `${asset}/USD`,
      ];

      for (const key of possibleKeys) {
        if (data[key]) {
          prices[pair] = parseFloat(data[key]);
          break;
        }
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching current prices:', error);
    return prices;
  }
}

/**
 * Check all active alerts and trigger notifications
 * This should be called periodically (e.g., every 60 seconds)
 */
export async function checkAlerts(): Promise<{
  checked: number;
  triggered: number;
  errors: number;
}> {
  const stats = {
    checked: 0,
    triggered: 0,
    errors: 0,
  };

  try {
    if (!prisma) {
      console.error('Database not available for alert checking');
      return stats;
    }

    // Fetch all active, non-triggered alerts
    const activeAlerts = await prisma.alert.findMany({
      where: {
        active: true,
        triggered: false,
      },
    });

    if (activeAlerts.length === 0) {
      console.log('No active alerts to check');
      return stats;
    }

    console.log(`Checking ${activeAlerts.length} active alerts...`);

    // Get unique asset pairs
    const pairs = [
      ...new Set(activeAlerts.map(a => `${a.asset}/${a.baseAsset}`))
    ];

    // Fetch current prices for all pairs
    const prices = await getCurrentPrices(pairs);

    // Check each alert
    for (const alert of activeAlerts) {
      try {
        stats.checked++;

        const pairKey = `${alert.asset}/${alert.baseAsset}`;
        const currentPrice = prices[pairKey];

        if (!currentPrice) {
          console.warn(`No price data for ${pairKey}, skipping alert ${alert.id}`);
          continue;
        }

        // Check if alert condition is met
        const shouldTrigger = checkAlertCondition(alert as Alert, currentPrice);

        if (shouldTrigger) {
          console.log(`Alert ${alert.id} triggered! ${pairKey} @ ${currentPrice}`);
          
          // Handle the triggered alert
          const result = await handleTriggeredAlert(alert as Alert, currentPrice);
          
          if (result.success) {
            stats.triggered++;
            console.log(`Alert ${alert.id} notifications sent to: ${result.sentChannels.join(', ')}`);
            if (result.failedChannels.length > 0) {
              console.warn(`Failed channels for alert ${alert.id}: ${result.failedChannels.join(', ')}`);
            }
          } else {
            stats.errors++;
            console.error(`Failed to handle triggered alert ${alert.id}:`, result.error);
          }
        }

        // Update lastChecked timestamp
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            lastChecked: new Date(),
            currentValue: currentPrice,
          },
        });

      } catch (error) {
        stats.errors++;
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }

    console.log(`Alert check complete: ${stats.checked} checked, ${stats.triggered} triggered, ${stats.errors} errors`);
    return stats;

  } catch (error) {
    console.error('Error in checkAlerts:', error);
    return stats;
  }
}
