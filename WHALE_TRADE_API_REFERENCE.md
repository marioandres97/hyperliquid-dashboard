# Whale Trade Tracking API Reference

## New API Endpoints

### Tracker Control API

#### GET /api/whale-trades/tracker
Get the current status of the whale trade tracker.

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "running": true,
    "trackedCount": 1234,
    "lastTrackTime": "2024-01-15T10:30:00Z",
    "uptime": 3600000,
    "errors": 2,
    "config": {
      "enabled": true,
      "autoStart": true,
      "batchSize": 10,
      "flushInterval": 5000,
      "retentionDays": 30
    }
  }
}
```

#### POST /api/whale-trades/tracker
Control the whale trade tracker (start, stop, or reset).

**Request Body:**
```json
{
  "action": "start" | "stop" | "reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tracker start successful",
  "data": {
    "enabled": true,
    "running": true,
    "trackedCount": 0,
    "lastTrackTime": null,
    "uptime": 0,
    "errors": 0
  }
}
```

**Actions:**
- `start`: Start the tracker (fails if already running)
- `stop`: Stop the tracker (fails if already stopped)
- `reset`: Reset statistics (tracked count, errors, last track time)

### Cleanup API

#### GET /api/whale-trades/cleanup
Preview how many trades would be deleted with the given retention period.

**Query Parameters:**
- `daysToKeep` (optional): Number of days to keep. Default: 30

**Example:**
```bash
GET /api/whale-trades/cleanup?daysToKeep=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "daysToKeep": 30,
    "cutoffDate": "2023-12-15T00:00:00Z",
    "tradesAffected": 150,
    "message": "150 trades would be deleted"
  }
}
```

#### POST /api/whale-trades/cleanup
Delete old whale trades beyond the retention period.

**Request Body:**
```json
{
  "daysToKeep": 30  // Optional, defaults to config value
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully cleaned up 150 old whale trades",
  "data": {
    "deletedCount": 150,
    "daysToKeep": 30,
    "cleanupDate": "2024-01-15T10:30:00Z"
  }
}
```

**Validation:**
- `daysToKeep` must be >= 0
- `daysToKeep` must be <= 365 (safety limit)

## Configuration

### Whale Trade Configuration

Configuration is centralized in `/config/whale-trades.config.ts`.

#### Asset Thresholds
Minimum USD values to qualify as a whale trade:

```typescript
{
  BTC: 100000,    // $100k
  ETH: 50000,     // $50k
  SOL: 25000,     // $25k
  DEFAULT: 10000  // $10k for all other assets
}
```

#### Category Thresholds
USD value ranges for trade categorization:

```typescript
{
  MEGA_WHALE: 1000000,   // $1M+
  WHALE: 100000,         // $100k+
  INSTITUTION: 50000,    // $50k+
  LARGE: 10000           // $10k+
}
```

#### Tracker Configuration

```typescript
{
  enabled: true,         // Enable whale trade tracking
  autoStart: true,       // Auto-start tracking on initialization
  batchSize: 10,         // Number of trades to batch
  flushInterval: 5000,   // Flush interval in milliseconds
  retentionDays: 30      // Days to retain whale trades
}
```

## TypeScript Types

All types are defined in `/types/whale-trades.ts`:

```typescript
import { 
  WhaleTrade, 
  WhaleTradeCategory, 
  TrackTradeInput,
  WhaleTradeFilters,
  WhaleTradeStats,
  ThresholdInfo
} from '@/types/whale-trades';
```

### Key Types

**WhaleTrade**: Complete whale trade record
**WhaleTradeCategory**: Enum for trade categories
**TrackTradeInput**: Input for tracking a new trade
**WhaleTradeFilters**: Filters for querying trades
**WhaleTradeStats**: Statistics aggregation
**ThresholdInfo**: Threshold configuration

## Usage Examples

### Control the Tracker

```typescript
// Start tracker
const startResponse = await fetch('/api/whale-trades/tracker', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'start' })
});

// Get tracker status
const statusResponse = await fetch('/api/whale-trades/tracker');
const status = await statusResponse.json();
console.log(`Tracker is ${status.data.running ? 'running' : 'stopped'}`);

// Stop tracker
const stopResponse = await fetch('/api/whale-trades/tracker', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'stop' })
});

// Reset statistics
const resetResponse = await fetch('/api/whale-trades/tracker', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'reset' })
});
```

### Cleanup Old Trades

```typescript
// Preview cleanup
const previewResponse = await fetch('/api/whale-trades/cleanup?daysToKeep=30');
const preview = await previewResponse.json();
console.log(`Would delete ${preview.data.tradesAffected} trades`);

// Perform cleanup
const cleanupResponse = await fetch('/api/whale-trades/cleanup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ daysToKeep: 30 })
});
const result = await cleanupResponse.json();
console.log(`Deleted ${result.data.deletedCount} trades`);
```

### Use Configuration

```typescript
import { 
  getAssetThreshold, 
  getCategoryEmoji,
  getWhaleTradeConfig 
} from '@/config/whale-trades.config';

// Get threshold for an asset
const btcThreshold = getAssetThreshold('BTC'); // 100000

// Get emoji for a category
const whaleEmoji = getCategoryEmoji('WHALE'); // 🐋

// Get complete configuration
const config = getWhaleTradeConfig();
console.log(config.tracker.retentionDays); // 30
```

## Rate Limiting

All whale trade endpoints are rate-limited:
- Free tier: 60 requests/minute
- Pro tier: 300 requests/minute
- API tier: 1000 requests/minute

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `429`: Rate limit exceeded
- `500`: Server error

## Security

- All endpoints use rate limiting
- Input validation on all parameters
- SQL injection protection via Prisma ORM
- Type safety with TypeScript

## Monitoring

The tracker maintains internal state:
- `trackedCount`: Total trades tracked
- `errors`: Number of errors encountered
- `lastTrackTime`: Timestamp of last tracked trade
- `uptime`: Milliseconds since tracker started

Use the status endpoint to monitor tracker health in production.
