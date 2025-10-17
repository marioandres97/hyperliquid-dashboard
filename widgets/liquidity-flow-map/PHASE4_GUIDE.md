# Phase 4: Advanced Analytics Guide

## Overview

Phase 4 completes the Liquidity Flow Map system with advanced analytics features including historical playback, volume profile analysis, mean reversion detection, automated trade setup generation, and comprehensive export capabilities.

## Table of Contents

1. [Historical Playback](#historical-playback)
2. [Volume Profile Analysis](#volume-profile-analysis)
3. [Mean Reversion Detection](#mean-reversion-detection)
4. [Trade Setup Generator](#trade-setup-generator)
5. [Performance Tracking](#performance-tracking)
6. [Export & Sharing](#export--sharing)
7. [Complete Example](#complete-example)
8. [API Reference](#api-reference)

## Historical Playback

The historical playback system provides time machine functionality with video-style controls for reviewing past market data.

### Features

- **Video-Style Controls**: Play, pause, stop, step forward/backward
- **Playback Speed**: 0.5x, 1x, 2x, 4x speed options
- **Bi-directional**: Forward and backward playback
- **Timeline Seeking**: Jump to any point in history
- **Automatic Recording**: Optional automatic snapshot capture

### Usage

```typescript
import { useHistoryPlayback } from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const {
    playbackState,
    currentSnapshot,
    progress,
    isPlaying,
    play,
    pause,
    stop,
    seekTo,
    addSnapshot,
  } = useHistoryPlayback({
    coin: 'BTC',
    autoRecord: true,
    recordInterval: 5000, // Record every 5 seconds
  });

  // Record snapshots manually
  useEffect(() => {
    if (flowData) {
      addSnapshot(flowData, patterns, alerts, currentPrice);
    }
  }, [flowData]);

  return (
    <HistoryPlaybackControls
      playbackState={playbackState}
      progress={progress}
      isPlaying={isPlaying}
      onPlay={play}
      onPause={pause}
      onStop={stop}
      onSeekTo={seekTo}
    />
  );
}
```

### Key Concepts

**Snapshots**: Complete state captures including:
- Flow data (trades, nodes, metrics)
- Detected patterns
- Active alerts
- Current price

**Playback State**:
```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  startTime: number;
  endTime: number;
  speed: number; // 0.5, 1, 2, 4
  direction: 'forward' | 'backward';
}
```

## Volume Profile Analysis

Volume Profile displays volume distribution across price levels with POC, VAH, and VAL markers.

### Features

- **POC (Point of Control)**: Price level with highest volume
- **VAH (Value Area High)**: Upper boundary of 70% volume area
- **VAL (Value Area Low)**: Lower boundary of 70% volume area
- **Delta Volume**: Buy volume - Sell volume at each level
- **High/Low Volume Nodes**: Areas of acceptance/rejection

### Usage

```typescript
import { useVolumeProfile, VolumeProfileChart } from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const { volumeProfile, isInValueArea, imbalances } = useVolumeProfile({
    coin: 'BTC',
    trades: flowData.trades,
    currentPrice: 50000,
  });

  return (
    <VolumeProfileChart
      volumeProfile={volumeProfile}
      currentPrice={currentPrice}
      showMarkers
      showDelta
    />
  );
}
```

### Volume Profile Markers

```typescript
interface VolumeProfileMarkers {
  poc: number;              // Highest volume price
  vah: number;              // Value area high
  val: number;              // Value area low
  totalVolume: number;
  valueAreaVolume: number;  // 70% of total
  profiles: VolumeProfile[];
}
```

### Trading Significance

- **Price at POC**: Fair value, likely to attract price
- **Inside Value Area**: Balanced market
- **Above VAH**: Bullish bias, potential reversal zone
- **Below VAL**: Bearish bias, potential reversal zone
- **Low Volume Nodes**: Areas of rejection, price moves quickly through

## Mean Reversion Detection

Detects overbought/oversold conditions and calculates reversion probabilities.

### Features

- **Standard Deviation Analysis**: Measures price deviation from mean
- **Probability Calculation**: Estimates reversion likelihood
- **Volume Confirmation**: Validates setups with volume
- **Pattern Confirmation**: Cross-references with price patterns

### Usage

```typescript
import { useMeanReversion } from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const {
    setups,
    overboughtSetups,
    oversoldSetups,
    bestSetup,
  } = useMeanReversion({
    coin: 'BTC',
    trades: flowData.trades,
    currentPrice: 50000,
    metrics: flowData.metrics,
  });

  return (
    <div>
      {bestSetup && (
        <div>
          <h3>{bestSetup.type.toUpperCase()}</h3>
          <p>Deviation: {bestSetup.deviation.toFixed(2)}σ</p>
          <p>Probability: {(bestSetup.reversionProbability * 100).toFixed(0)}%</p>
          <p>Target: ${bestSetup.targetPrice.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
```

### Configuration

```typescript
const config: MeanReversionConfig = {
  lookbackPeriod: 100,           // Number of trades to analyze
  deviationThreshold: 2.0,       // Std devs for signal
  volumeConfirmationThreshold: 1.5,
  minConfidence: 0.6,
};
```

## Trade Setup Generator

Combines all analytics to generate actionable trade setups with entry, targets, and stops.

### Features

- **Multi-Strategy**: Combines patterns, volume profile, mean reversion
- **Risk Management**: Calculates stop loss and risk:reward ratios
- **Quality Scoring**: Ranks setups by quality (0-100)
- **Performance Tracking**: Monitors setup results

### Usage

```typescript
import { useTradeSetups } from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const {
    setups,
    activeSetups,
    bestSetup,
    getPerformance,
  } = useTradeSetups({
    coin: 'BTC',
    currentPrice: 50000,
    patterns,
    volumeProfile,
    meanReversion,
    absorptionZones,
    supportResistance,
  });

  return (
    <div>
      {setups.map(setup => (
        <div key={setup.id}>
          <h3>{setup.description}</h3>
          <p>Type: {setup.type}</p>
          <p>Entry: ${setup.entry.toFixed(2)}</p>
          <p>Target: ${setup.target1.toFixed(2)}</p>
          <p>Stop: ${setup.stopLoss.toFixed(2)}</p>
          <p>R:R: 1:{setup.riskRewardRatio.toFixed(2)}</p>
          <p>Quality: {setup.quality.toFixed(0)}/100</p>
        </div>
      ))}
    </div>
  );
}
```

### Trade Setup Structure

```typescript
interface TradeSetup {
  id: string;
  coin: Coin;
  type: 'long' | 'short';
  quality: number;        // 0-100
  confidence: number;     // 0-1
  
  entry: number;
  target1: number;
  target2: number;
  stopLoss: number;
  riskRewardRatio: number;
  
  patterns: DetectedPattern[];
  volumeProfile?: VolumeProfileMarkers;
  meanReversion?: MeanReversionSetup;
  
  description: string;
  reasoning: string[];
  risks: string[];
  status: 'active' | 'triggered' | 'completed' | 'stopped';
}
```

### Setup Types

1. **Pattern-Based**: Breakouts, breakdowns, whale activity
2. **Mean Reversion**: Overbought/oversold reversions
3. **Absorption Zone**: Support/resistance from large orders
4. **Volume Profile**: Price returning to POC or value area

## Performance Tracking

Tracks the performance of trade setups in real-time.

### Features

- **Real-time P&L**: Track profit/loss as price moves
- **Max Drawdown**: Monitor risk exposure
- **Max Profit**: Track potential gains
- **Win Rate**: Calculate success percentage
- **Status Tracking**: Open, win, loss, breakeven

### Usage

```typescript
import { PerformanceTracker } from '@/widgets/liquidity-flow-map';

function MyComponent() {
  const { allPerformance, getPerformance } = useTradeSetups({...});

  return (
    <PerformanceTracker
      performances={allPerformance}
      setups={setups}
      onSelectSetup={(id) => console.log('Selected:', id)}
    />
  );
}
```

## Export & Sharing

Export data and visualizations in multiple formats.

### Supported Formats

- **Screenshot** (PNG): High-quality image of dashboard
- **Video**: Series of frames showing playback
- **CSV**: Raw data for spreadsheets
- **JSON**: Complete state export
- **PDF**: Professional report with charts and analysis

### Usage

```typescript
import { getExportService } from '@/widgets/liquidity-flow-map';

const exportService = getExportService();

// Screenshot
const screenshot = await exportService.exportScreenshot('dashboard-id');
exportService.download(screenshot);

// CSV
const csv = exportService.exportCSV(flowData);
exportService.download(csv);

// JSON
const json = exportService.exportJSON(data);
exportService.download(json);

// PDF Report
const pdf = await exportService.exportPDF(
  'BTC Analysis',
  metrics,
  patterns,
  setups
);
exportService.download(pdf);

// Share (if supported)
await exportService.share(result);
```

### Export Configuration

```typescript
interface ExportConfig {
  format: 'screenshot' | 'video' | 'csv' | 'json' | 'pdf';
  includePatterns: boolean;
  includeMetrics: boolean;
  includeSetups: boolean;
  timeRange?: {
    start: number;
    end: number;
  };
}
```

## Complete Example

See `Phase4Example.tsx` for a comprehensive implementation showcasing all Phase 4 features:

```typescript
import { Phase4Example } from '@/widgets/liquidity-flow-map';

function App() {
  return <Phase4Example coin="BTC" />;
}
```

The example includes:
- Historical playback controls
- Volume profile chart
- Mean reversion detection
- Trade setup generation
- Performance tracking
- Pattern insights
- Export functionality

## API Reference

### Services

#### HistoryPlaybackService
- `addSnapshot()`: Record a snapshot
- `getSnapshots()`: Get all snapshots
- `getSnapshotAt()`: Get snapshot at timestamp
- `play()`: Start playback
- `pause()`: Pause playback
- `stop()`: Stop and reset
- `seekTo()`: Jump to timestamp
- `setSpeed()`: Change playback speed

#### VolumeProfileService
- `calculateFromTrades()`: Build profile from trades
- `calculateFromNodes()`: Build profile from nodes
- `calculateMarkers()`: Get POC/VAH/VAL
- `getVolumeProfile()`: Complete analysis
- `isInValueArea()`: Check if price in VA

#### MeanReversionDetector
- `detectSetups()`: Find reversion opportunities
- `detectFromNodes()`: Analyze from nodes
- `updateConfig()`: Change detection parameters

#### TradeSetupGenerator
- `generateSetups()`: Create trade setups
- `updatePerformance()`: Track setup performance
- `getActiveSetups()`: Get active setups
- `getPerformance()`: Get setup performance

#### ExportService
- `exportScreenshot()`: Create PNG image
- `exportVideo()`: Create video frames
- `exportCSV()`: Export to CSV
- `exportJSON()`: Export to JSON
- `exportPDF()`: Generate PDF report
- `download()`: Download file
- `share()`: Share via Web Share API

### Hooks

#### useHistoryPlayback
- Returns: playback controls and state
- Options: coin, autoRecord, recordInterval

#### useVolumeProfile
- Returns: volume profile and analysis
- Options: coin, trades, nodes, currentPrice

#### useMeanReversion
- Returns: reversion setups
- Options: coin, trades, currentPrice, metrics

#### useTradeSetups
- Returns: trade setups and performance
- Options: coin, currentPrice, all analytics

### Components

#### HistoryPlaybackControls
- Props: playback state, control callbacks
- Features: Video-style UI, speed control, timeline

#### VolumeProfileChart
- Props: volumeProfile, currentPrice
- Features: POC/VAH/VAL markers, delta display

#### SetupDetailModal
- Props: setup, performance, callbacks
- Features: Full setup details, reasoning, risks

#### PerformanceTracker
- Props: performances, setups
- Features: Stats, open/closed positions, win rate

## Best Practices

1. **Recording**: Record snapshots at consistent intervals (5-10 seconds)
2. **Volume Profile**: Use with appropriate price grouping for your asset
3. **Mean Reversion**: Combine with volume and pattern confirmation
4. **Trade Setups**: Filter by quality score (>70 recommended)
5. **Performance**: Track all setups for statistical analysis
6. **Export**: Regular exports for historical analysis

## Performance Considerations

- **Memory**: ~10MB per 100 snapshots
- **Computation**: Volume profile recalculates on interval
- **Storage**: Automatic cleanup of old snapshots (>1000)
- **Export**: Screenshots use html2canvas (client-side only)

## Troubleshooting

**Playback not working?**
- Ensure snapshots are being recorded
- Check that playback state is initialized

**Volume profile empty?**
- Verify sufficient trade data
- Check minimum volume threshold

**No setups generated?**
- Confirm all required analytics are available
- Lower quality threshold in config
- Check confidence requirements

**Export fails?**
- Verify element ID exists for screenshots
- Check browser permissions for sharing
- Ensure data is available for export

## Next Steps

Phase 4 completes the core Liquidity Flow Map system. Future enhancements could include:

- Machine learning pattern recognition
- Multi-timeframe analysis
- Automated strategy backtesting
- Real-time alerts and notifications
- Advanced risk management tools

## Support

For questions or issues:
- See examples in `Phase4Example.tsx`
- Check existing Phase 3 implementations
- Review type definitions in `types/index.ts`
