/**
 * Alert Trigger Handler
 * Handles triggered alerts, sends notifications, and creates history
 * Server-side only
 */

import { prisma } from '@/lib/database/client';
import { sendAlertNotifications } from '@/lib/notifications/sender';
import type { Alert } from '@/types/alerts';

export interface TriggerResult {
  success: boolean;
  sentChannels: string[];
  failedChannels: string[];
  error?: string;
}

/**
 * Handle a triggered alert
 * - Mark alert as triggered
 * - Send notifications to all channels
 * - Create history entry
 * - Optionally deactivate alert (for one-time alerts)
 */
export async function handleTriggeredAlert(
  alert: Alert,
  currentValue: number
): Promise<TriggerResult> {
  try {
    if (!prisma) {
      return {
        success: false,
        sentChannels: [],
        failedChannels: alert.channels,
        error: 'Database not available',
      };
    }

    // Get notification settings for user
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: alert.userId || 'default-user' },
    });

    // If no settings, create default with only push enabled
    const notificationSettings = settings || {
      email: null,
      telegramChatId: null,
      whatsappNumber: null,
      pushEnabled: true,
      emailEnabled: false,
      telegramEnabled: false,
      whatsappEnabled: false,
    };

    // Send notifications to all configured channels
    const results = await sendAlertNotifications(
      alert.channels,
      {
        asset: alert.asset,
        baseAsset: alert.baseAsset,
        type: alert.type,
        target: alert.targetValue,
        current: currentValue,
      },
      notificationSettings
    );

    // Separate successful and failed channels
    const sentChannels = results.filter(r => r.success).map(r => r.channel);
    const failedChannels = results.filter(r => !r.success).map(r => r.channel);

    // Mark alert as triggered
    await prisma.alert.update({
      where: { id: alert.id },
      data: {
        triggered: true,
        triggeredAt: new Date(),
        triggeredCount: alert.triggeredCount + 1,
        lastTriggered: new Date(),
        currentValue: currentValue,
        // Optionally deactivate after trigger (for one-time alerts)
        // active: false,
      },
    });

    // Create history entry
    await prisma.alertHistory.create({
      data: {
        alertId: alert.id,
        asset: alert.asset,
        baseAsset: alert.baseAsset,
        type: alert.type,
        targetValue: alert.targetValue,
        actualValue: currentValue,
        channels: alert.channels,
        sentChannels,
        failedChannels,
      },
    });

    return {
      success: true,
      sentChannels,
      failedChannels,
    };
  } catch (error) {
    console.error('Error handling triggered alert:', error);
    return {
      success: false,
      sentChannels: [],
      failedChannels: alert.channels,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if alert condition is met
 */
export function checkAlertCondition(
  alert: Alert,
  currentPrice: number
): boolean {
  switch (alert.type) {
    case 'price_above':
      return currentPrice > alert.targetValue;
    
    case 'price_below':
      return currentPrice < alert.targetValue;
    
    case 'volume_spike':
      // Volume spike logic would require historical volume data
      // For now, we'll just return false as it needs more context
      return false;
    
    default:
      return false;
  }
}
