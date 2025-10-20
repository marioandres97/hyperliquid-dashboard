# Alert System Architecture Overview

## System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Interface                              │
├─────────────────────────────────────────────────────────────────────┤
│  /alerts Page (AlertDashboard)                                      │
│  ├─ AlertCreationForm: Create alerts for ANY crypto                 │
│  ├─ AlertsList: Display with filters (All/Active/Triggered)         │
│  ├─ AlertCard: Individual alert display with actions                │
│  ├─ AlertEditModal: Edit existing alerts                            │
│  ├─ DeleteConfirmModal: Confirm before deletion                     │
│  └─ AlertHistoryTable: View triggered alerts                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          React Hooks                                 │
├─────────────────────────────────────────────────────────────────────┤
│  useAlerts: CRUD operations with SWR caching                        │
│  useNotificationSettings: Manage notification preferences           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Routes                                  │
├─────────────────────────────────────────────────────────────────────┤
│  POST   /api/alerts              - Create alert                     │
│  GET    /api/alerts              - List alerts (with filters)       │
│  PUT    /api/alerts/[id]         - Update alert                     │
│  DELETE /api/alerts/[id]         - Delete alert                     │
│  GET    /api/alerts/history      - Get alert history                │
│  POST   /api/alerts/check        - Manual alert check               │
│  POST   /api/alerts/test         - Test notifications               │
│  GET    /api/notifications/settings - Get settings                  │
│  PUT    /api/notifications/settings - Update settings               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐  ┌──────────────────────────────┐
│   Alert Checking System       │  │   Notification System        │
├───────────────────────────────┤  ├──────────────────────────────┤
│  lib/alerts/checker.ts        │  │  lib/notifications/sender.ts │
│  - Fetch active alerts        │  │  - Orchestrate all channels  │
│  - Get current prices         │  │                              │
│  - Check conditions           │  │  Channels:                   │
│  - Trigger if met             │  │  ├─ push.ts (Browser)        │
│                               │  │  ├─ email.ts (SendGrid)      │
│  lib/alerts/trigger-handler.ts│  │  ├─ telegram.ts (Bot API)    │
│  - Mark as triggered          │  │  └─ whatsapp.ts (Twilio)     │
│  - Send notifications         │  │                              │
│  - Create history entry       │  │                              │
└───────────────────────────────┘  └──────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Database (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────────┤
│  Alert                                                               │
│  ├─ id, userId, asset, baseAsset, type, targetValue                 │
│  ├─ channels[], name, notes                                         │
│  ├─ active, triggered, triggeredCount                               │
│  └─ triggeredAt, lastChecked, createdAt, updatedAt                  │
│                                                                      │
│  AlertHistory                                                        │
│  ├─ id, alertId, asset, baseAsset, type                             │
│  ├─ targetValue, actualValue, triggeredAt                           │
│  └─ channels[], sentChannels[], failedChannels[]                    │
│                                                                      │
│  NotificationSettings                                                │
│  ├─ id, userId, email, telegramChatId, whatsappNumber               │
│  └─ pushEnabled, emailEnabled, telegramEnabled, whatsappEnabled     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Creating an Alert

```
User Input → Validation (Zod) → API POST /api/alerts → Database Insert
                                          │
                                          └─> Return Alert → Update UI
```

### Alert Checking (Every 60s)

```
Cron/Worker → POST /api/alerts/check → checker.ts
                                           │
                                           ├─> Fetch Active Alerts
                                           ├─> Get Current Prices (Hyperliquid API)
                                           ├─> Check Each Alert
                                           │   ├─ Condition Met?
                                           │   │   Yes → trigger-handler.ts
                                           │   │          ├─> Get User Settings
                                           │   │          ├─> Send Notifications
                                           │   │          ├─> Mark as Triggered
                                           │   │          └─> Create History Entry
                                           │   └─ No → Update lastChecked
                                           └─> Return Stats
```

### Notification Flow

```
Alert Triggered → sender.ts (Orchestrator)
                     │
                     ├─> Push? → push.ts → Browser Notification
                     ├─> Email? → email.ts → SendGrid → Email
                     ├─> Telegram? → telegram.ts → Bot API → Telegram
                     └─> WhatsApp? → whatsapp.ts → Twilio → WhatsApp
                     
                     Results → Track Success/Failures → Update History
```

## Key Components

### Frontend (Client)
- **AlertDashboard**: Main container with stats
- **AlertCreationForm**: Multi-step form with validation
- **AlertsList**: Grid/list with filtering
- **Modals**: Edit, Delete confirmation
- **Badges**: Channel and Status indicators

### Backend (Server)
- **API Routes**: RESTful endpoints for CRUD
- **Checkers**: Background price monitoring
- **Handlers**: Trigger processing logic
- **Notifiers**: Multi-channel delivery

### Database
- **Alert**: Core alert configuration
- **AlertHistory**: Audit trail of triggers
- **NotificationSettings**: User preferences

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Validation**: Zod
- **Data Fetching**: SWR with caching
- **Notifications**: 
  - Web Notification API (Push)
  - SendGrid (Email)
  - Telegram Bot API
  - Twilio (WhatsApp)

## Performance Features

- ✅ SWR caching (reduces API calls)
- ✅ Optimistic UI updates
- ✅ Auto-refresh every 30s
- ✅ Batch price fetching
- ✅ Conditional rendering
- ✅ Lazy loading modals
- ✅ Efficient re-renders

## Security Features

- ✅ Zod validation on all inputs
- ✅ Server-side API keys only
- ✅ CSRF protection (Next.js)
- ✅ Input sanitization
- ✅ Type safety (TypeScript)
- ✅ Error boundaries

## Scalability Considerations

- Database indexes on frequently queried fields
- SWR deduplication prevents duplicate requests
- Efficient alert checking (batch operations)
- Configurable check intervals
- Horizontal scaling ready (stateless API)
