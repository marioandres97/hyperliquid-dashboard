/**
 * Browser Push Notifications Handler
 * Uses Web Notification API for browser push notifications
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Browser does not support notifications');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

/**
 * Send browser push notification
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    // Create notification
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-512.png',
      tag: payload.tag || 'alert-notification',
      data: payload.data,
      badge: '/icon-192.png',
      requireInteraction: false,
    });

    // Add click handler to navigate to alerts page
    notification.onclick = () => {
      window.focus();
      window.location.href = '/alerts';
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Send alert triggered push notification
 */
export async function sendAlertPushNotification(
  asset: string,
  baseAsset: string,
  type: string,
  target: number,
  current: number
): Promise<boolean> {
  const condition = type === 'price_above' ? 'above' : type === 'price_below' ? 'below' : 'spike';
  
  return await sendPushNotification({
    title: '🔔 Alert Triggered!',
    body: `${asset}/${baseAsset} is now ${condition} ${target}. Current: ${current}`,
    tag: `alert-${asset}-${Date.now()}`,
    data: {
      asset,
      baseAsset,
      type,
      target,
      current,
      timestamp: new Date().toISOString(),
    }
  });
}

/**
 * Send test push notification
 */
export async function sendTestPushNotification(): Promise<boolean> {
  return await sendPushNotification({
    title: '🔔 Test Notification',
    body: 'This is a test notification from the Alert System. If you see this, push notifications are working!',
    tag: 'test-notification',
  });
}
