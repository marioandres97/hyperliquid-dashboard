import { z } from 'zod';

// Alert type enums
export type AlertType = 'price_above' | 'price_below' | 'volume_spike';
export type BaseAsset = 'USDT' | 'USDC' | 'USD' | 'BTC' | 'ETH';
export type NotificationChannel = 'push' | 'email' | 'telegram' | 'whatsapp';

// Alert interface matching new schema
export interface Alert {
  id: string;
  userId?: string | null;
  asset: string;
  baseAsset: BaseAsset;
  type: AlertType;
  targetValue: number;
  currentValue?: number | null;
  channels: NotificationChannel[];
  name?: string | null;
  notes?: string | null;
  active: boolean;
  triggered: boolean;
  triggeredCount: number;
  triggeredAt?: Date | null;
  lastChecked?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Alert history interface
export interface AlertHistory {
  id: string;
  alertId: string;
  asset: string;
  baseAsset: string;
  type: string;
  targetValue: number;
  actualValue: number;
  triggeredAt: Date;
  channels: string[];
  sentChannels: string[];
  failedChannels: string[];
}

// Notification settings interface
export interface NotificationSettings {
  id: string;
  userId: string;
  email?: string | null;
  telegramChatId?: string | null;
  whatsappNumber?: string | null;
  pushEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  whatsappEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Zod validation schemas
export const alertSchema = z.object({
  asset: z.string().min(1, 'Asset is required').max(10, 'Asset symbol too long'),
  baseAsset: z.enum(['USDT', 'USDC', 'USD', 'BTC', 'ETH']),
  type: z.enum(['price_above', 'price_below', 'volume_spike']),
  targetValue: z.number().positive('Target value must be positive'),
  channels: z.array(z.enum(['push', 'email', 'telegram', 'whatsapp'])).min(1, 'Select at least one channel'),
  name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const updateAlertSchema = z.object({
  targetValue: z.number().positive('Target value must be positive').optional(),
  channels: z.array(z.enum(['push', 'email', 'telegram', 'whatsapp'])).min(1, 'Select at least one channel').optional(),
  name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  active: z.boolean().optional(),
});

export const notificationSettingsSchema = z.object({
  email: z.string().email('Invalid email address').optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  telegramEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
});

// Input types
export type CreateAlertInput = z.infer<typeof alertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

/**
 * Get alert description for display
 */
export function getAlertDescription(alert: Alert): string {
  const assetPair = `${alert.asset}/${alert.baseAsset}`;
  
  switch (alert.type) {
    case 'price_above':
      return `${alert.name || assetPair} > ${formatCurrency(alert.targetValue, alert.baseAsset)}`;
    case 'price_below':
      return `${alert.name || assetPair} < ${formatCurrency(alert.targetValue, alert.baseAsset)}`;
    case 'volume_spike':
      return `${alert.name || assetPair} volume spike > ${alert.targetValue}%`;
    default:
      return 'Unknown alert';
  }
}

/**
 * Format currency value based on base asset
 */
export function formatCurrency(value: number, baseAsset: BaseAsset): string {
  if (baseAsset === 'BTC') {
    return `${value.toFixed(8)} BTC`;
  } else if (baseAsset === 'ETH') {
    return `${value.toFixed(6)} ETH`;
  } else {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Get channel icon emoji
 */
export function getChannelIcon(channel: NotificationChannel): string {
  const icons: Record<NotificationChannel, string> = {
    push: '📲',
    email: '💌',
    telegram: '📱',
    whatsapp: '📞'
  };
  return icons[channel];
}

/**
 * Get channel display name
 */
export function getChannelName(channel: NotificationChannel): string {
  const names: Record<NotificationChannel, string> = {
    push: 'Push',
    email: 'Email',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp'
  };
  return names[channel];
}
