/**
 * Telegram Notifications Handler
 * Server-side only - do not import in client components
 */

/**
 * Send Telegram message via Bot API
 */
export async function sendTelegramMessage(
  chatId: string,
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not configured');
      return false;
    }

    if (!chatId) {
      console.warn('Telegram chatId not provided');
      return false;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      console.error('Telegram API error:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Send alert triggered Telegram notification
 */
export async function sendAlertTelegramNotification(
  chatId: string,
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
🔔 <b>Alert Triggered!</b>

<b>Asset:</b> ${asset}/${baseAsset}
<b>Type:</b> Price ${condition}
<b>Target:</b> ${target.toLocaleString()}
<b>Current:</b> ${current.toLocaleString()}
<b>Time:</b> ${timestamp}

<a href="https://venomouz-insightz.com/alerts">Open Dashboard</a>
  `.trim();

  return await sendTelegramMessage(chatId, message, 'HTML');
}

/**
 * Send test Telegram notification
 */
export async function sendTestTelegramNotification(chatId: string): Promise<boolean> {
  const message = `
🔔 <b>Test Notification</b>

This is a test notification from the Alert System.
If you see this, Telegram notifications are working!
  `.trim();

  return await sendTelegramMessage(chatId, message, 'HTML');
}
