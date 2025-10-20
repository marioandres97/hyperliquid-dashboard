/**
 * Notification Sender Orchestrator
 * Coordinates sending notifications across multiple channels
 * Server-side only
 */

import { sendAlertEmailNotification, sendTestEmailNotification } from './email';
import { sendAlertTelegramNotification, sendTestTelegramNotification } from './telegram';
import { sendAlertWhatsAppNotification, sendTestWhatsAppNotification } from './whatsapp';
import type { NotificationChannel } from '@/types/alerts';

export interface NotificationPayload {
  asset: string;
  baseAsset: string;
  type: string;
  target: number;
  current: number;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

/**
 * Send alert notification to specified channels
 * Returns array of results for each channel
 */
export async function sendAlertNotifications(
  channels: NotificationChannel[],
  payload: NotificationPayload,
  settings: {
    email?: string | null;
    telegramChatId?: string | null;
    whatsappNumber?: string | null;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    telegramEnabled?: boolean;
    whatsappEnabled?: boolean;
  }
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  // Send to each enabled channel
  for (const channel of channels) {
    let success = false;
    let error: string | undefined;

    try {
      switch (channel) {
        case 'push':
          // Push notifications are handled client-side
          // Just mark as successful if enabled
          success = settings.pushEnabled ?? true;
          if (!success) {
            error = 'Push notifications disabled in settings';
          }
          break;

        case 'email':
          if (!settings.emailEnabled) {
            error = 'Email notifications disabled in settings';
          } else if (!settings.email) {
            error = 'Email address not configured';
          } else {
            success = await sendAlertEmailNotification(
              settings.email,
              payload.asset,
              payload.baseAsset,
              payload.type,
              payload.target,
              payload.current
            );
            if (!success) {
              error = 'Failed to send email';
            }
          }
          break;

        case 'telegram':
          if (!settings.telegramEnabled) {
            error = 'Telegram notifications disabled in settings';
          } else if (!settings.telegramChatId) {
            error = 'Telegram chat ID not configured';
          } else {
            success = await sendAlertTelegramNotification(
              settings.telegramChatId,
              payload.asset,
              payload.baseAsset,
              payload.type,
              payload.target,
              payload.current
            );
            if (!success) {
              error = 'Failed to send Telegram message';
            }
          }
          break;

        case 'whatsapp':
          if (!settings.whatsappEnabled) {
            error = 'WhatsApp notifications disabled in settings';
          } else if (!settings.whatsappNumber) {
            error = 'WhatsApp number not configured';
          } else {
            success = await sendAlertWhatsAppNotification(
              settings.whatsappNumber,
              payload.asset,
              payload.baseAsset,
              payload.type,
              payload.target,
              payload.current
            );
            if (!success) {
              error = 'Failed to send WhatsApp message';
            }
          }
          break;
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    results.push({ channel, success, error });
  }

  return results;
}

/**
 * Send test notifications to specified channels
 */
export async function sendTestNotifications(
  channels: NotificationChannel[],
  settings: {
    email?: string | null;
    telegramChatId?: string | null;
    whatsappNumber?: string | null;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    telegramEnabled?: boolean;
    whatsappEnabled?: boolean;
  }
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  for (const channel of channels) {
    let success = false;
    let error: string | undefined;

    try {
      switch (channel) {
        case 'push':
          // Push notifications are handled client-side
          success = settings.pushEnabled ?? true;
          if (!success) {
            error = 'Push notifications disabled in settings';
          }
          break;

        case 'email':
          if (!settings.emailEnabled) {
            error = 'Email notifications disabled in settings';
          } else if (!settings.email) {
            error = 'Email address not configured';
          } else {
            success = await sendTestEmailNotification(settings.email);
            if (!success) {
              error = 'Failed to send test email';
            }
          }
          break;

        case 'telegram':
          if (!settings.telegramEnabled) {
            error = 'Telegram notifications disabled in settings';
          } else if (!settings.telegramChatId) {
            error = 'Telegram chat ID not configured';
          } else {
            success = await sendTestTelegramNotification(settings.telegramChatId);
            if (!success) {
              error = 'Failed to send test Telegram message';
            }
          }
          break;

        case 'whatsapp':
          if (!settings.whatsappEnabled) {
            error = 'WhatsApp notifications disabled in settings';
          } else if (!settings.whatsappNumber) {
            error = 'WhatsApp number not configured';
          } else {
            success = await sendTestWhatsAppNotification(settings.whatsappNumber);
            if (!success) {
              error = 'Failed to send test WhatsApp message';
            }
          }
          break;
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    results.push({ channel, success, error });
  }

  return results;
}
