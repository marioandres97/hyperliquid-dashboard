# Alert System Documentation 🔔

## Overview

The Hyperliquid Dashboard Alert System provides comprehensive cryptocurrency price alerts with multi-channel notifications. Create alerts for **ANY cryptocurrency** (not limited to BTC/ETH/HYPE) with support for multiple base assets and notification channels.

## Features

### ✅ Universal Asset Support
- Create alerts for **ANY cryptocurrency**: BTC, ETH, SOL, DOGE, AVAX, MATIC, and more
- Multiple base asset options: USDT, USDC, USD, BTC, ETH
- Real-time price monitoring via Hyperliquid API

### ✅ Alert Types
1. **Price Above**: Triggered when asset price goes above target value
2. **Price Below**: Triggered when asset price goes below target value
3. **Volume Spike**: Triggered when volume increases by specified percentage (future enhancement)

### ✅ Multi-Channel Notifications
- **Push Notifications**: Browser notifications (requires permission)
- **Email**: SendGrid integration with HTML templates
- **Telegram**: Telegram Bot API integration
- **WhatsApp**: Twilio API integration

### ✅ CRUD Operations
- **Create**: Add new alerts with comprehensive validation
- **Read**: View all alerts with filtering (All, Active, Triggered)
- **Update**: Edit alert parameters and notification channels
- **Delete**: Remove alerts with confirmation

### ✅ Alert Management
- Toggle alerts active/inactive
- View alert history
- Track trigger count
- Filter by status

## Setup

### 1. Database Configuration

The alert system requires a PostgreSQL database. Set up your `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hyperliquid?schema=public
```

Run database migrations:

```bash
npm run db:migrate
```

### 2. Notification Configuration (Optional)

Configure notification channels by adding API keys to `.env.local`:

#### SendGrid (Email)
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=alerts@venomouz-insightz.com
```

#### Telegram Bot
```env
TELEGRAM_BOT_TOKEN=your_bot_token
```

Get your Chat ID:
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your Chat ID
3. Configure in Notification Settings panel

#### Twilio (WhatsApp)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 3. Background Alert Checking

Alerts need to be checked periodically to trigger notifications. You have two options:

#### Option A: Cron Job (Recommended)

Set up a cron job to call the alert checker every minute:

```bash
# Add to crontab (crontab -e)
* * * * * curl -X POST http://localhost:3000/api/alerts/check
```

Or use a service like [cron-job.org](https://cron-job.org) for production:
- URL: `https://your-domain.com/api/alerts/check`
- Method: POST
- Interval: Every 1 minute

#### Option B: Vercel Cron (Vercel Deployments)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/alerts/check",
    "schedule": "* * * * *"
  }]
}
```

## Usage

### Creating Alerts

1. Navigate to `/alerts` page
2. Click "Create Alert" button
3. Fill in the form:
   - **Asset**: Any crypto symbol (e.g., SOL, DOGE, AVAX)
   - **Base Asset**: Select USDT, USDC, USD, BTC, or ETH
   - **Alert Type**: Choose Price Above, Price Below, or Volume Spike
   - **Target Value**: Set the threshold value
   - **Notification Channels**: Select one or more channels
   - **Name** (optional): Give your alert a custom name
   - **Notes** (optional): Add notes about the alert

4. Click "Create Alert"

**Examples:**
- "Alert me when SOL > 150 USDC"
- "Alert me when DOGE < 0.08 USDT"
- "Alert me when AVAX volume spikes 50%"
- "Alert me when ETH < 3500 USD"

### Managing Alerts

#### Editing Alerts
1. Click the edit icon (✏️) on any active alert
2. Modify target value, channels, name, or notes
3. Click "Update Alert"

#### Toggling Alerts
- Click the toggle icon to activate/deactivate an alert
- Inactive alerts won't be checked or trigger notifications
- Maintains alert history

#### Deleting Alerts
1. Click the delete icon (🗑️) on any alert
2. Confirm deletion in the modal
3. Alert and its history will be permanently deleted

### Filtering Alerts

Use the filter tabs to view:
- **All**: All alerts regardless of status
- **Active**: Only active, non-triggered alerts
- **Triggered**: Only alerts that have been triggered

### Notification Settings

Configure notification channels:
1. Navigate to Notification Settings panel
2. Enter credentials for each channel:
   - **Email**: Your email address
   - **Telegram**: Your chat ID
   - **WhatsApp**: Your phone number (format: +1234567890)
3. Enable/disable each channel globally
4. Save settings

### Testing Notifications

Test your notification setup:
1. Configure notification settings
2. Click "Send Test Notification"
3. Select channels to test
4. Check if notifications are received

## API Endpoints

### Alerts

- `GET /api/alerts` - List all alerts
  - Query params: `active=true`, `triggered=false`
- `POST /api/alerts` - Create new alert
- `GET /api/alerts/[id]` - Get single alert
- `PUT /api/alerts/[id]` - Update alert
- `DELETE /api/alerts/[id]` - Delete alert
- `GET /api/alerts/history` - Get alert history
- `POST /api/alerts/check` - Manually trigger alert check
- `POST /api/alerts/test` - Send test notification

### Notification Settings

- `GET /api/notifications/settings` - Get settings
- `PUT /api/notifications/settings` - Update settings

## Database Schema

### Alert Model
```prisma
model Alert {
  id            String    @id @default(cuid())
  userId        String?   @default("default-user")
  asset         String    // ANY crypto
  baseAsset     String    @default("USDT")
  type          String    // price_above | price_below | volume_spike
  targetValue   Float
  currentValue  Float?
  channels      String[]  // [push, email, telegram, whatsapp]
  name          String?
  notes         String?
  active        Boolean   @default(true)
  triggered     Boolean   @default(false)
  triggeredCount Int      @default(0)
  triggeredAt   DateTime?
  lastChecked   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### AlertHistory Model
```prisma
model AlertHistory {
  id              String   @id @default(cuid())
  alertId         String
  asset           String
  baseAsset       String
  type            String
  targetValue     Float
  actualValue     Float
  triggeredAt     DateTime @default(now())
  channels        String[]
  sentChannels    String[]
  failedChannels  String[]
}
```

### NotificationSettings Model
```prisma
model NotificationSettings {
  id              String   @id @default(cuid())
  userId          String   @unique @default("default-user")
  email           String?
  telegramChatId  String?
  whatsappNumber  String?
  pushEnabled     Boolean  @default(true)
  emailEnabled    Boolean  @default(false)
  telegramEnabled Boolean  @default(false)
  whatsappEnabled Boolean  @default(false)
}
```

## Validation

All alert inputs are validated using Zod schemas:

```typescript
const alertSchema = z.object({
  asset: z.string().min(1).max(10),
  baseAsset: z.enum(['USDT', 'USDC', 'USD', 'BTC', 'ETH']),
  type: z.enum(['price_above', 'price_below', 'volume_spike']),
  targetValue: z.number().positive(),
  channels: z.array(z.enum(['push', 'email', 'telegram', 'whatsapp'])).min(1),
  name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
```

## Troubleshooting

### Alerts Not Triggering

1. **Check Alert Checker**: Ensure the cron job or background worker is running
2. **Verify Asset Symbol**: Make sure the asset symbol matches Hyperliquid's format
3. **Check Logs**: Look at server logs for errors during price checking
4. **Manual Check**: Call `POST /api/alerts/check` to manually trigger checking

### Notifications Not Received

1. **Push Notifications**:
   - Ensure browser notification permission is granted
   - Check if browser supports notifications
   - Verify notifications are enabled in browser settings

2. **Email**:
   - Verify SENDGRID_API_KEY is set
   - Check email address in notification settings
   - Look for emails in spam folder

3. **Telegram**:
   - Ensure TELEGRAM_BOT_TOKEN is valid
   - Verify chat ID is correct
   - Check if bot has permission to message you

4. **WhatsApp**:
   - Verify Twilio credentials
   - Ensure phone number format is correct (+1234567890)
   - Check Twilio account balance

### Database Connection Issues

- Verify DATABASE_URL is correct
- Ensure database is running
- Check database user has proper permissions
- Run migrations if schema is outdated

## Performance Considerations

- Alerts are checked every 60 seconds (configurable)
- Price data is fetched from Hyperliquid API
- SWR caching reduces unnecessary API calls
- Optimistic UI updates for better UX

## Security

- All API routes validate inputs using Zod
- Notification credentials stored server-side only
- No sensitive data exposed to client
- CSRF protection via Next.js
- Rate limiting recommended for production

## Future Enhancements

- [ ] Volume spike detection with historical data
- [ ] Support for multiple price sources
- [ ] Advanced alert conditions (e.g., RSI, MACD)
- [ ] Alert templates
- [ ] Sound notifications
- [ ] Discord integration
- [ ] Slack integration
- [ ] Price charts in alert history
- [ ] Export alert history to CSV
- [ ] Alert sharing

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoint responses for error details
