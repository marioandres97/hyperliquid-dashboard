/**
 * WhatsApp Notifications Handler (Twilio)
 * Server-side only - do not import in client components
 */

/**
 * Send WhatsApp message via Twilio API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured');
      return false;
    }

    if (!to) {
      console.warn('WhatsApp number not provided');
      return false;
    }

    // Ensure number is in WhatsApp format
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: toNumber,
          Body: message,
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error('Twilio API error:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Send alert triggered WhatsApp notification
 */
export async function sendAlertWhatsAppNotification(
  to: string,
  asset: string,
  baseAsset: string,
  type: string,
  target: number,
  current: number
): Promise<boolean> {
  const condition = type === 'price_above' ? 'Above' : type === 'price_below' ? 'Below' : 'Spike';
  const timestamp = new Date().toLocaleString('en-US', { 
    timeZone: 'UTC',
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  const message = `
🔔 *Alert Triggered!*

*Asset:* ${asset}/${baseAsset}
*Type:* Price ${condition}
*Target:* ${target.toLocaleString()}
*Current:* ${current.toLocaleString()}
*Time:* ${timestamp}

View Dashboard: https://venomouz-insightz.com/alerts
  `.trim();

  return await sendWhatsAppMessage(to, message);
}

/**
 * Send test WhatsApp notification
 */
export async function sendTestWhatsAppNotification(to: string): Promise<boolean> {
  const message = `
🔔 *Test Notification*

This is a test notification from the Alert System.
If you see this, WhatsApp notifications are working!
  `.trim();

  return await sendWhatsAppMessage(to, message);
}
