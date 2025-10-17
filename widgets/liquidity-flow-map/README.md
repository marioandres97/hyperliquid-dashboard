# Liquidity Flow Map Widget

## Overview

The Liquidity Flow Map is a comprehensive data collection and analysis infrastructure for tracking liquidity flows in cryptocurrency markets. It aggregates and classifies trade and liquidation data in real-time to provide insights into market dynamics.

## Features

### Data Collection
- **Real-time Trade Collection**: WebSocket-based collection of all trades with automatic reconnection
- **Liquidation Tracking**: Monitor liquidation events with cascade risk assessment
- **Multi-Coin Support**: Track BTC, ETH, and HYPE simultaneously
- **Automatic Classification**: Classify trades by size (whale, large, medium, small)

### Aggregation & Analysis
- **Liquidity Nodes**: Aggregate trades at price levels with configurable grouping
- **Flow Metrics**: Calculate comprehensive metrics including CVD, imbalances, and whale activity
- **Time-Series Data**: Generate time-series for visualization and trend analysis
- **Signal Detection**: Identify whale accumulation, distribution, and liquidation cascades

### Storage & Persistence
- **Redis Storage**: Efficient storage with automatic TTL management
- **Historical Queries**: Retrieve historical flow data by time range
- **Memory Optimization**: Sliding windows and data pruning

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Liquidity Flow Map                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │   Hooks     │  │    Services      │  │  Storage  │ │
│  ├─────────────┤  ├──────────────────┤  ├───────────┤ │
│  │ Flow Data   │─▶│ Trade Collector  │  │   Redis   │ │
│  │ Classify    │  │ Liq. Collector   │◀─│   Schema  │ │
│  │ Aggregate   │  │ Data Aggregator  │  │    TTL    │ │
│  └─────────────┘  └──────────────────┘  └───────────┘ │
│         │                   │                          │
│         ▼                   ▼                          │
│  ┌─────────────────────────────────┐                  │
│  │          Utilities              │                  │
│  ├─────────────────────────────────┤                  │
│  │ Classifiers  │ Flow Calculators │                  │
│  └─────────────────────────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Installation

This widget is part of the hyperliquid-dashboard project. Dependencies are already included.

## Usage

### Basic Usage

```typescript
import { useLiquidityFlowData } from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const { flowData, metrics, timeSeries, isCollecting } = useLiquidityFlowData({
    coin: 'BTC',
    timeWindow: '5m',
    updateInterval: 1000,
  });

  return (
    <div>
      <h2>Flow Direction: {metrics?.flowDirection}</h2>
      <p>Net Flow: {metrics?.netFlow}</p>
      <p>Whale Trades: {metrics?.whaleTradeCount}</p>
    </div>
  );
}
```

### With Classification

```typescript
import { 
  useLiquidityFlowData, 
  useFlowClassification 
} from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const { metrics, timeSeries } = useLiquidityFlowData({
    coin: 'ETH',
    timeWindow: '15m',
  });

  const { classification } = useFlowClassification({
    metrics,
    timeSeries,
  });

  return (
    <div>
      <h3>{classification?.direction} Flow</h3>
      <p>Strength: {classification?.strength}%</p>
      <ul>
        {classification?.signals.map(signal => (
          <li key={signal.type}>{signal.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Direct Service Access

```typescript
import { 
  getTradeCollector, 
  getDataAggregator 
} from '@/widgets/liquidity-flow-map';

// Subscribe to trades
const collector = getTradeCollector();
collector.subscribe('BTC', (trade) => {
  console.log('New trade:', trade);
});

// Get aggregated data
const aggregator = getDataAggregator();
const flowData = aggregator.getFlowData('BTC', '5m');
console.log('Flow metrics:', flowData.metrics);
```

## Type System

### Core Types

- **Coin**: `'BTC' | 'ETH' | 'HYPE'`
- **TimeWindow**: `'1m' | '5m' | '15m' | '1h' | '4h'`
- **FlowDirection**: `'inflow' | 'outflow' | 'neutral'`
- **LiquidityLevel**: `'whale' | 'large' | 'medium' | 'small'`

### Data Structures

- **ClassifiedTrade**: Trade with size classification and metadata
- **ClassifiedLiquidation**: Liquidation with cascade risk assessment
- **LiquidityNode**: Aggregated flow at a price level
- **FlowMetrics**: Comprehensive flow analysis metrics
- **FlowClassification**: Classified flow with signals

See [types/index.ts](./types/index.ts) for full type definitions.

## Configuration

### Trade Classification Thresholds

```typescript
const TRADE_THRESHOLDS = {
  whale: {
    BTC: 1_000_000,  // $1M
    ETH: 800_000,    // $800k
    HYPE: 300_000,   // $300k
  },
  large: {
    BTC: 500_000,
    ETH: 400_000,
    HYPE: 150_000,
  },
  medium: {
    BTC: 100_000,
    ETH: 80_000,
    HYPE: 30_000,
  },
};
```

### Aggregation Config

```typescript
const config: AggregationConfig = {
  timeWindow: '5m',
  priceGrouping: 10,     // Group by $10 for BTC
  minTradeSize: 1000,    // Filter dust trades
  whaleThreshold: 500000, // $500k
  updateInterval: 1000,  // Update every 1s
};
```

## Storage Schema

Flow data is stored in Redis with automatic TTL management:

- **1m windows**: 1 hour retention
- **5m windows**: 4 hours retention
- **15m windows**: 12 hours retention
- **1h windows**: 24 hours retention
- **4h windows**: 7 days retention

See [STORAGE_SCHEMA.md](./STORAGE_SCHEMA.md) for detailed schema documentation.

## API Endpoints

The widget requires these API endpoints for storage:

- `POST /api/liquidity-flow/store` - Store flow data
- `GET /api/liquidity-flow/retrieve` - Retrieve flow data
- `GET /api/liquidity-flow/historical` - Get historical data
- `DELETE /api/liquidity-flow/delete` - Delete flow data
- `DELETE /api/liquidity-flow/clear/:coin` - Clear coin data

## Performance

### Memory Usage
- In-memory storage: ~10K trades per coin
- Automatic pruning of old data
- Efficient Map-based node aggregation

### Real-time Processing
- Sub-millisecond classification
- ~1 second aggregation updates
- WebSocket with auto-reconnect

### Storage Efficiency
- Compressed JSON storage
- TTL-based automatic cleanup
- ~500KB per hour for 3 coins

## Testing

```bash
# Build project
npm run build

# The infrastructure is ready to be tested with actual WebSocket data
# Integration tests would require a running Hyperliquid WebSocket connection
```

## Future Enhancements

- [ ] Advanced pattern recognition
- [ ] Machine learning-based flow prediction
- [ ] Multi-exchange support
- [ ] Real-time alerts and notifications
- [ ] 3D visualization of liquidity maps
- [ ] Historical backtesting framework

## License

Part of hyperliquid-dashboard project.
