# Liquidity Flow Map - Redis Storage Schema

## Overview
This document describes the Redis storage schema for the Liquidity Flow Map data collection system.

## Key Structure

### Flow Data Snapshots
**Pattern**: `liquidity-flow:{coin}:{timeWindow}:{timestamp}`

**Example**: `liquidity-flow:BTC:5m:1697558400000`

**Description**: Stores aggregated flow data for a specific coin, time window, and timestamp.

## TTL Configuration

Different time windows have different retention periods:

| Time Window | TTL (seconds) | TTL (human) |
|-------------|---------------|-------------|
| 1m          | 3,600         | 1 hour      |
| 5m          | 14,400        | 4 hours     |
| 15m         | 43,200        | 12 hours    |
| 1h          | 86,400        | 24 hours    |
| 4h          | 604,800       | 7 days      |

## Data Structure

### StoredFlowData
```typescript
{
  key: string;                    // Redis key
  coin: 'BTC' | 'ETH' | 'HYPE';  // Coin symbol
  timeWindow: TimeWindow;         // Time window
  timestamp: number;              // Window timestamp (ms)
  data: {
    nodes: [                      // Array of [price, LiquidityNode]
      [number, {
        price: number;
        buyVolume: number;
        sellVolume: number;
        netFlow: number;
        buyCount: number;
        sellCount: number;
        dominantSide: 'buy' | 'sell' | 'neutral';
        whaleActivity: boolean;
        liquidations: number;
        timestamp: number;
      }]
    ],
    metrics: {                    // Aggregated metrics
      totalBuyVolume: number;
      totalSellVolume: number;
      totalBuyNotional: number;
      totalSellNotional: number;
      netFlow: number;
      flowDirection: 'inflow' | 'outflow' | 'neutral';
      totalTrades: number;
      buyTradeCount: number;
      sellTradeCount: number;
      avgTradeSize: number;
      whaleTradeCount: number;
      whaleBuyVolume: number;
      whaleSellVolume: number;
      whaleNetFlow: number;
      totalLiquidations: number;
      longLiquidations: number;
      shortLiquidations: number;
      totalLiquidationVolume: number;
      highestBuyLevel: number | null;
      highestSellLevel: number | null;
      mostActivePrice: number | null;
      volumeImbalance: number;
      tradeImbalance: number;
      whaleImbalance: number;
    },
    timeSeries: [                 // Time-series data points
      {
        timestamp: number;
        netFlow: number;
        buyVolume: number;
        sellVolume: number;
        whaleFlow: number;
        liquidationVolume: number;
        price: number;
      }
    ]
  },
  expiresAt: number;             // Expiration timestamp (ms)
}
```

## API Endpoints

### Store Flow Data
```
POST /api/liquidity-flow/store
Body: StoredFlowData
Response: { success: boolean }
```

### Retrieve Flow Data
```
GET /api/liquidity-flow/retrieve?key={key}
Response: StoredFlowData | 404
```

### Historical Flow Data
```
GET /api/liquidity-flow/historical?coin={coin}&timeWindow={window}&start={start}&end={end}
Response: StoredFlowData[]
```

### Delete Flow Data
```
DELETE /api/liquidity-flow/delete
Body: { key: string }
Response: { success: boolean }
```

### Clear Coin Data
```
DELETE /api/liquidity-flow/clear/{coin}
Response: { success: boolean }
```

## Storage Patterns

### 1. Real-time Storage
Flow data is stored periodically (every 1-5 minutes) as aggregations complete.

### 2. Historical Queries
Query historical data by time range:
```typescript
const historicalData = await getHistoricalFlowData(
  'BTC',
  '5m',
  startTime,
  endTime
);
```

### 3. Data Cleanup
Automatic TTL-based cleanup ensures old data is removed:
- Short-term data (1m, 5m) expires quickly
- Long-term data (1h, 4h) retained for analysis

## Memory Considerations

### Estimated Storage per Window
- **1m window**: ~5KB per snapshot
- **5m window**: ~10KB per snapshot
- **15m window**: ~20KB per snapshot
- **1h window**: ~50KB per snapshot
- **4h window**: ~100KB per snapshot

### Total Storage Estimate (3 coins, all windows)
- Per hour: ~500KB
- Per day: ~12MB
- Per week: ~85MB

### Optimization Strategies
1. Store only aggregated metrics, not raw trades
2. Use compression for large datasets
3. Implement sliding windows to limit data growth
4. Prune nodes with minimal activity

## Indexing

### Scan Pattern for Historical Queries
```
SCAN 0 MATCH liquidity-flow:BTC:5m:*
```

### Sorted Sets for Time-based Queries
For efficient time-range queries, maintain sorted sets:
```
ZADD liquidity-flow:BTC:5m:index {timestamp} {key}
ZRANGEBYSCORE liquidity-flow:BTC:5m:index {start} {end}
```

## Monitoring

### Key Metrics to Track
- Total keys per coin
- Memory usage per time window
- Storage write/read latency
- TTL compliance (keys expiring as expected)

### Redis Commands for Monitoring
```redis
# Count keys
DBSIZE

# Memory usage
MEMORY USAGE liquidity-flow:BTC:5m:1697558400000

# Check TTL
TTL liquidity-flow:BTC:5m:1697558400000

# Pattern scan
SCAN 0 MATCH liquidity-flow:* COUNT 100
```
