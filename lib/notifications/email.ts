/**
 * Email Notifications Handler (SendGrid)
 * Server-side only - do not import in client components
 */

export interface EmailNotificationPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Send email notification via SendGrid
 */
export async function sendEmailNotification(payload: EmailNotificationPayload): Promise<boolean> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'alerts@venomouz-insightz.com';

    if (!apiKey) {
      console.warn('SENDGRID_API_KEY not configured');
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: payload.to }],
            subject: payload.subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: 'text/plain',
            value: payload.text,
          },
          {
            type: 'text/html',
            value: payload.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('SendGrid API error:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Generate HTML email template for alert
 */
function generateAlertEmailHTML(
  asset: string,
  baseAsset: string,
  type: string,
  target: number,
  current: number,
  timestamp: string
): string {
  const condition = type === 'price_above' ? 'Above' : type === 'price_below' ? 'Below' : 'Spike';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alert Triggered</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🔔 Alert Triggered!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">Alert Details</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <strong style="color: #666;">Asset:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <span style="color: #10B981; font-weight: bold; font-size: 16px;">${asset}/${baseAsset}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <strong style="color: #666;">Type:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <span style="color: #333;">Price ${condition}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <strong style="color: #666;">Target:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <span style="color: #333;">${target.toLocaleString()}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <strong style="color: #666;">Current:</strong>
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <span style="color: #10B981; font-weight: bold;">${current.toLocaleString()}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: #666;">Time:</strong>
                  </td>
                  <td style="padding: 12px 0; text-align: right;">
                    <span style="color: #333;">${timestamp}</span>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://venomouz-insightz.com/alerts" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Dashboard</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                You received this email because you have an active alert on Venomouz Insightz.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send alert triggered email notification
 */
export async function sendAlertEmailNotification(
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

  return await sendEmailNotification({
    to,
    subject: `Alert Triggered: ${asset}/${baseAsset}`,
    text: `Alert Triggered!\n\nAsset: ${asset}/${baseAsset}\nType: Price ${condition}\nTarget: ${target}\nCurrent: ${current}\nTime: ${timestamp}`,
    html: generateAlertEmailHTML(asset, baseAsset, type, target, current, timestamp),
  });
}

/**
 * Send test email notification
 */
export async function sendTestEmailNotification(to: string): Promise<boolean> {
  return await sendEmailNotification({
    to,
    subject: '🔔 Test Notification - Venomouz Insightz',
    text: 'This is a test notification from the Alert System. If you see this, email notifications are working!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px; text-align: center;">
          <tr>
            <td>
              <h1 style="margin: 0 0 20px 0; color: #10B981;">🔔 Test Notification</h1>
              <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">
                This is a test notification from the Alert System.<br>
                If you see this, email notifications are working!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
