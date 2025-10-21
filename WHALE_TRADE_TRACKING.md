# Whale Trade Tracking System

A comprehensive system for tracking and monitoring large cryptocurrency trades (whale trades) on Hyperliquid DEX.

## Overview

The whale trade tracking system automatically detects, categorizes, and stores significant trades based on asset-specific thresholds. It provides real-time monitoring, historical data storage, and powerful querying capabilities.

## Features

- **Asset-Specific Thresholds**: Different minimum trade sizes for different assets
- **Automatic Categorization**: Trades are categorized into four tiers based on notional value
- **Real-Time Tracking**: Automatic detection and storage of whale trades
- **Comprehensive API**: RESTful endpoints for querying and analyzing whale trades
- **React Hooks**: Easy-to-use hooks for frontend integration
- **Database Persistence**: PostgreSQL storage with optimized indexes
- **Statistics**: Real-time statistics and aggregations

## Thresholds

### Asset-Specific Thresholds (Minimum USD Value)

| Asset | Threshold |
|-------|-----------|
| BTC   | $100,000  |
| ETH   | $50,000   |
| SOL   | $25,000   |
| Others| $10,000   |

### Category Thresholds (USD Value)

| Category    | Threshold | Emoji |
|-------------|-----------|-------|
| MEGA_WHALE  | $1M+      | 🐋🐋  |
| WHALE       | $100K+    | 🐋    |
| INSTITUTION | $50K+     | 🏦    |
| LARGE       | $10K+     | 💰    |

## Architecture

### Database Model

```prisma
model WhaleTrade {
  id            String   @id @default(cuid())
  asset         String   // BTC, ETH, SOL, etc.
  side          String   // BUY or SELL
  price         Float
  size          Float    // Amount in asset
  notionalValue Float    // USD value of trade
  category      String   // MEGA_WHALE, WHALE, INSTITUTION, LARGE
  exchange      String   @default("Hyperliquid")
  tradeId       String?  // External trade ID
  timestamp     DateTime @default(now())
  priceImpact   Float?   // Price impact percentage
  metadata      Json?    // Additional metadata
  createdAt     DateTime @default(now())
  
  @@index([asset])
  @@index([category])
  @@index([timestamp])
  @@index([notionalValue])
}
```

### Key Components

1. **WhaleTradeRepository**: Database operations and queries
2. **whaleTradeTracker**: Service for tracking and categorizing trades
3. **API Routes**: RESTful endpoints for data access
4. **React Hooks**: Frontend integration utilities
5. **Integration**: Automatic tracking via `useLargeOrders` hook

## Usage

### Backend: Track a Trade

```typescript
import { whaleTradeTracker } from '@/lib/services/whaleTradeTracker';

// Track a single trade
const result = await whaleTradeTracker.trackTrade({
  asset: 'BTC',
  side: 'BUY',
  price: 50000,
  size: 3,
  timestamp: new Date(),
  tradeId: 'external-123',
  priceImpact: 0.5,
});

if (result.isWhaleTrade) {
  console.log(`Whale trade detected: ${result.category}`);
  console.log(`Notional value: $${result.notionalValue}`);
  console.log(`Stored: ${result.stored}`);
}
```

### Frontend: Display Whale Trades

```tsx
import { useWhaleTrades } from '@/hooks/useWhaleTrades';

function WhaleTrades() {
  const { trades, loading, error } = useWhaleTrades({
    asset: 'BTC',
    category: 'WHALE',
    hours: 24,
    limit: 50,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {trades.map(trade => (
        <div key={trade.id}>
          {trade.asset} {trade.side} - ${trade.notionalValue}
        </div>
      ))}
    </div>
  );
}
```

### Frontend: Display Statistics

```tsx
import { useWhaleTradeStats } from '@/hooks/useWhaleTrades';

function WhaleStats() {
  const { stats, loading } = useWhaleTradeStats({
    asset: 'BTC',
  });

  if (loading || !stats) return <div>Loading...</div>;

  return (
    <div>
      <p>Total Trades: {stats.totalTrades}</p>
      <p>Total Volume: ${stats.totalVolume.toLocaleString()}</p>
      <p>Avg Trade Size: ${stats.avgTradeSize.toLocaleString()}</p>
      <p>Buy/Sell: {stats.buyCount}/{stats.sellCount}</p>
    </div>
  );
}
```

### Frontend: Get Thresholds

```tsx
import { useWhaleThresholds } from '@/hooks/useWhaleTrades';

function ThresholdInfo() {
  const { thresholds, loading } = useWhaleThresholds();

  if (loading || !thresholds) return <div>Loading...</div>;

  return (
    <div>
      <h3>Asset Thresholds</h3>
      {Object.entries(thresholds.assetThresholds).map(([asset, threshold]) => (
        <div key={asset}>
          {asset}: ${threshold.toLocaleString()}
        </div>
      ))}
    </div>
  );
}
```

## API Endpoints

### GET /api/whale-trades

Retrieve whale trades with optional filters.

**Query Parameters:**
- `asset` (string): Filter by asset (e.g., BTC, ETH, SOL)
- `category` (string): Filter by category (MEGA_WHALE, WHALE, INSTITUTION, LARGE)
- `side` (string): Filter by side (BUY, SELL)
- `minNotionalValue` (number): Minimum USD value
- `maxNotionalValue` (number): Maximum USD value
- `startDate` (ISO string): Start date for filtering
- `endDate` (ISO string): End date for filtering
- `hours` (number): Get trades from last N hours
- `limit` (number): Maximum results (default: 100, max: 1000)
- `skip` (number): Skip N results for pagination
- `stats` (boolean): Return statistics instead of trades
- `thresholds` (boolean): Return threshold information

**Examples:**

```bash
# Get all BTC whale trades from last 24 hours
GET /api/whale-trades?asset=BTC&hours=24

# Get mega whale trades only
GET /api/whale-trades?category=MEGA_WHALE&limit=50

# Get statistics for ETH
GET /api/whale-trades?asset=ETH&stats=true

# Get threshold information
GET /api/whale-trades?thresholds=true

# Get trades with pagination
GET /api/whale-trades?limit=50&skip=100
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "asset": "BTC",
      "side": "BUY",
      "price": 50000,
      "size": 3,
      "notionalValue": 150000,
      "category": "WHALE",
      "exchange": "Hyperliquid",
      "timestamp": "2024-01-01T12:00:00Z",
      "priceImpact": 0.5,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

### POST /api/whale-trades

Track a new trade and store it if it meets whale criteria.

**Request Body:**

```json
{
  "asset": "BTC",
  "side": "BUY",
  "price": 50000,
  "size": 3,
  "timestamp": "2024-01-01T12:00:00Z",
  "tradeId": "external-123",
  "priceImpact": 0.5,
  "metadata": {
    "source": "websocket"
  }
}
```

**Response (Whale Trade):**

```json
{
  "success": true,
  "data": {
    "isWhaleTrade": true,
    "category": "WHALE",
    "notionalValue": 150000,
    "threshold": 100000,
    "stored": true,
    "tradeId": "clx123..."
  }
}
```

**Response (Below Threshold):**

```json
{
  "success": false,
  "error": "Trade does not meet whale threshold",
  "data": {
    "isWhaleTrade": false,
    "notionalValue": 50000,
    "threshold": 100000,
    "stored": false
  }
}
```

## Storage Estimates

Based on typical usage patterns:

- **Trades per day**: ~1,000
- **Database storage per month**: ~10-15 MB
- **Database storage per year**: ~120-180 MB

Each whale trade record is approximately 500-700 bytes including indexes.

## Automatic Integration

The whale trade tracking system is automatically integrated with the existing large order monitoring system through the `useLargeOrders` hook. All large orders detected are automatically tracked in the database if they meet whale thresholds.

```typescript
// In useLargeOrders.ts
if (isLargeOrder(order.usdValue, minSize)) {
  newLargeOrders.push(order);
  
  // Automatic whale trade tracking
  whaleTradeTracker.trackTrade({
    asset: order.coin,
    side: order.side,
    price: order.price,
    size: order.size,
    timestamp: new Date(order.timestamp),
    tradeId: order.id,
    priceImpact: order.priceImpact,
  }).catch(error => {
    console.error('Failed to track whale trade:', error);
  });
}
```

## Example Component

A complete example component is available at:
`components/whale-trades/WhaleTradesDashboard.tsx`

This component demonstrates:
- Filtering by asset, category, and time range
- Displaying statistics
- Real-time refresh
- Responsive table layout

## Testing

Comprehensive test suite included:

```bash
npm test -- tests/unit/services/whaleTradeTracker.test.ts
```

**Test Coverage:**
- Threshold calculations
- Trade categorization
- Trade tracking and storage
- Batch processing
- Formatting utilities

## Database Maintenance

### Cleanup Old Trades

```typescript
import { whaleTradeRepository } from '@/lib/database/repositories/whaleTrade.repository';

// Delete trades older than 30 days
const deletedCount = await whaleTradeRepository.cleanupOld(30);
console.log(`Cleaned up ${deletedCount} old trades`);
```

### Get Recent Trades

```typescript
// Get trades from last 24 hours
const recentTrades = await whaleTradeRepository.getRecent(24, 100);
```

### Get Statistics

```typescript
// Get stats for all trades
const stats = await whaleTradeRepository.getStats();

// Get stats for specific asset
const btcStats = await whaleTradeRepository.getStats({
  asset: 'BTC',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});
```

## Performance Considerations

1. **Indexes**: Database includes indexes on `asset`, `category`, `timestamp`, and `notionalValue` for fast queries
2. **Batch Operations**: Use `trackTrades()` for processing multiple trades efficiently
3. **Pagination**: Use `limit` and `skip` parameters for large result sets
4. **Caching**: Consider implementing Redis caching for frequently accessed statistics
5. **Cleanup**: Schedule regular cleanup jobs to maintain optimal database size

## Security

- **Rate Limiting**: All API endpoints include rate limiting
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Protection**: Prisma ORM provides built-in protection
- **Authentication**: Can be easily integrated with existing auth system

## Future Enhancements

Potential improvements:

1. **Real-time Notifications**: WebSocket-based alerts for whale trades
2. **Pattern Detection**: Identify accumulation/distribution patterns
3. **Historical Analysis**: Advanced analytics and trends
4. **Export Functionality**: CSV/JSON export of whale trades
5. **Dashboard Integration**: Add whale trades section to main dashboard
6. **Alert System**: Integrate with existing alert system for whale trade notifications

## License

MIT
