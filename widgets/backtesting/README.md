# Backtesting Module A - Day Trading MVP

A comprehensive backtesting system for day trading strategies on Hyperliquid DEX.

## Features

### 🎯 Pre-built Strategies

1. **Funding Rate Extremes** - Mean reversion on extreme funding rate conditions
2. **OI Expansion + Volume** - Momentum following significant OI and volume spikes
3. **Liquidation Clusters** - Counter-trend trades after mass liquidation events
4. **Cross-Asset Correlation** - BTC-ETH correlation breakdown trades

### 💰 Conservative Cost Model

- **Fees**: Base fees x1.5 multiplier (0.07% taker, 0.05% maker)
- **Slippage**: Dynamic based on volatility (0.05% base + 0.03% volatility adjustment)
- **Funding**: Always assumes worst case (negative bias, 75th percentile rates)

### 📊 Comprehensive Metrics

- **Risk Metrics**: Sharpe, Sortino, Calmar ratios
- **Drawdown Analysis**: Max drawdown, duration tracking
- **Performance Quality**: Profit factor, win rate, expectancy
- **Market Regimes**: Bull/bear/sideways performance breakdown

### 🚨 Validation System

Automatic red flag detection for:
- Sharpe ratio >3.0 (overfitting)
- Win rate >70% (unrealistic)
- Insufficient trades <100
- Regime-specific failures
- Concentrated wins

## Architecture

```
widgets/backtesting/
├── BacktestingWidget.tsx          # Main widget component
├── types.ts                        # TypeScript interfaces
├── services/
│   ├── hyperliquidHistorical.ts  # API data fetching
│   └── dataValidator.ts           # Data validation
├── engine/
│   ├── backtestEngine.ts         # Main backtesting orchestrator
│   ├── positionManager.ts        # Position & PnL management
│   ├── costCalculator.ts         # Conservative cost calculations
│   └── metricsCalculator.ts      # Performance metrics
├── strategies/
│   ├── baseStrategy.ts           # Base strategy class
│   ├── fundingRateExtreme.ts     # Strategy 1
│   ├── oiExpansion.ts            # Strategy 2
│   ├── liquidationClusters.ts    # Strategy 3
│   └── crossAssetCorrelation.ts  # Strategy 4
└── components/
    ├── ConfigurationPanel.tsx     # User configuration UI
    ├── ResultsDashboard.tsx       # Results display
    ├── MetricsGrid.tsx            # Metrics cards
    ├── EquityCurveChart.tsx       # Equity visualization
    ├── TradesTable.tsx            # Trade history
    ├── ValidationAlerts.tsx       # Red flags display
    ├── RegimeAnalysis.tsx         # Market regime breakdown
    └── StressTestResults.tsx      # Stress test results
```

## Usage

### Basic Backtest

1. Select a strategy from the dropdown
2. Choose asset (BTC, ETH, HYPE)
3. Set backtest period (30-180 days)
4. Configure risk parameters:
   - Initial capital
   - Position size (% of capital)
   - Leverage (1x-20x)
   - Stop loss & take profit
5. Click "Run Backtest"

### Interpreting Results

#### ✅ Good Strategy
- Sharpe ratio: 1.5 - 3.0
- Win rate: 45% - 65%
- Profit factor: >1.5
- Max drawdown: <20%
- Performs reasonably in all regimes

#### ❌ Red Flags
- Sharpe >3.0 → Likely overfitted
- Win rate >70% → Unrealistic
- <100 trades → Insufficient sample
- Fails completely in any regime

### Export Options

- **CSV**: Trade-by-trade details for external analysis
- **JSON**: Complete backtest results including config and metrics

## Philosophy: "The Tool Is Your Adversary"

This backtesting system is designed to be brutally honest:

1. **Conservative by Default**: All costs are multiplied, slippage is added, funding is negative
2. **Strict Validation**: Automatically rejects strategies that look too good to be true
3. **Multi-Regime Testing**: Must work in bull, bear, and sideways markets
4. **Full Transparency**: Shows ALL costs, no hidden assumptions
5. **Realistic Expectations**: Past performance ≠ future results

## Data Sources

- **Candles**: Hyperliquid API (`candleSnapshot`)
- **Funding Rates**: Hyperliquid API (`fundingHistory`)
- **Open Interest**: Hyperliquid API (`metaAndAssetCtxs`) + simulation
- **Liquidations**: Hyperliquid historical data repository (future enhancement)

## Extending the Module

### Adding a New Strategy

```typescript
import { BaseStrategy } from './baseStrategy';
import { Signal, MarketData, Position } from '../types';

export class MyCustomStrategy extends BaseStrategy {
  constructor() {
    super('My Strategy', 'Strategy description');
  }

  generateSignals(
    marketData: MarketData,
    currentIndex: number,
    openPositions: Position[]
  ): Signal[] {
    // Your strategy logic here
    return signals;
  }
}
```

Then add it to `backtestEngine.ts`:

```typescript
case 'myCustomStrategy':
  return new MyCustomStrategy();
```

## Limitations

- **Look-ahead Bias**: Strategies are developed with hindsight
- **Market Conditions**: Past markets may differ from future
- **Execution**: Real trading has additional complexities
- **Slippage**: Actual slippage may vary
- **Liquidity**: Historical data may not reflect future liquidity

## Disclaimer

⚠️ **Past performance does not guarantee future results.**

This tool is for educational purposes only. Always:
- Practice proper risk management
- Start with small position sizes
- Never risk more than you can afford to lose
- Understand that backtests have limitations

## Future Enhancements (Module B)

- Real-time order book data capture
- Scalping strategies (sub-1h timeframes)
- Walk-forward optimization
- Monte Carlo simulation
- Live trading integration
- Parameter optimization (grid search)

## Dependencies

- `date-fns`: Date manipulation
- `papaparse`: CSV parsing (for liquidation data)
- `recharts`: Chart visualization
- `lucide-react`: Icons

## License

Part of the Hyperliquid Dashboard project.
