export type AlertType = 'price' | 'large_order' | 'volume';
export type AlertCondition = 'above' | 'below';
export type AlertSide = 'BUY' | 'SELL' | 'BOTH';
export type AlertCoin = 'BTC' | 'ETH' | 'HYPE' | 'ALL';

export interface Alert {
  id: string;
  userId?: string | null;
  type: AlertType;
  coin: AlertCoin;
  condition?: AlertCondition | null;
  value: number;
  side?: AlertSide | null;
  enabled: boolean;
  browserNotif: boolean;
  emailNotif: boolean;
  webhook?: string | null;
  triggered: number;
  lastTriggered?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  coin: string;
  price?: number | null;
  orderSize?: number | null;
  volume?: number | null;
  triggeredAt: Date;
}

export interface CreateAlertInput {
  type: AlertType;
  coin: AlertCoin;
  condition?: AlertCondition;
  value: number;
  side?: AlertSide;
  browserNotif?: boolean;
  emailNotif?: boolean;
  webhook?: string;
}

export interface UpdateAlertInput {
  enabled?: boolean;
  value?: number;
  browserNotif?: boolean;
  emailNotif?: boolean;
  webhook?: string;
}

/**
 * Get alert description for display
 */
export function getAlertDescription(alert: Alert): string {
  switch (alert.type) {
    case 'price':
      return `${alert.coin} price ${alert.condition} $${alert.value.toLocaleString()}`;
    case 'large_order':
      return `${alert.coin === 'ALL' ? 'Any coin' : alert.coin} order ${alert.side} > $${alert.value.toLocaleString()}`;
    case 'volume':
      return `${alert.coin} volume spike > ${alert.value}%`;
    default:
      return 'Unknown alert';
  }
}

/**
 * Validate alert input
 */
export function validateAlertInput(input: CreateAlertInput): string | null {
  if (!input.type) {
    return 'Alert type is required';
  }

  if (!input.coin) {
    return 'Coin is required';
  }

  if (input.value <= 0) {
    return 'Value must be greater than 0';
  }

  if (input.type === 'price' && !input.condition) {
    return 'Condition is required for price alerts';
  }

  if (input.type === 'large_order' && !input.side) {
    return 'Side is required for large order alerts';
  }

  return null;
}
