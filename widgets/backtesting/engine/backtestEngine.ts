import { 
  BacktestConfig, 
  BacktestResult, 
  MarketData, 
  Trade, 
  EquityPoint,
  ValidationResult,
  RedFlag,
  Warning,
  DAY_TRADING_THRESHOLDS
} from '../types';
import { PositionManager } from './positionManager';
import { MetricsCalculator } from './metricsCalculator';
import { CostCalculator } from './costCalculator';
import { BaseStrategy } from '../strategies/baseStrategy';
import { FundingRateExtremeStrategy } from '../strategies/fundingRateExtreme';
import { OIExpansionStrategy } from '../strategies/oiExpansion';
import { LiquidationClustersStrategy } from '../strategies/liquidationClusters';
import { CrossAssetCorrelationStrategy } from '../strategies/crossAssetCorrelation';

export class BacktestEngine {
  private positionManager: PositionManager;
  private metricsCalculator: MetricsCalculator;
  private costCalculator: CostCalculator;
  private strategy: BaseStrategy;

  constructor(private config: BacktestConfig) {
    this.positionManager = new PositionManager(
      config.riskConfig,
      config.costConfig
    );
    this.metricsCalculator = new MetricsCalculator();
    this.costCalculator = new CostCalculator(config.costConfig);
    this.strategy = this.createStrategy(config.strategy);
  }

  /**
   * Create strategy instance based on type
   */
  private createStrategy(strategyType: string): BaseStrategy {
    switch (strategyType) {
      case 'fundingRateExtreme':
        return new FundingRateExtremeStrategy();
      case 'oiExpansion':
        return new OIExpansionStrategy();
      case 'liquidationClusters':
        return new LiquidationClustersStrategy();
      case 'crossAssetCorrelation':
        return new CrossAssetCorrelationStrategy();
      default:
        return new FundingRateExtremeStrategy();
    }
  }

  /**
   * Run backtest
   */
  async run(marketData: MarketData): Promise<BacktestResult> {
    const startTime = Date.now();
    console.log(`Starting backtest with ${this.strategy.getName()} strategy`);

    const trades: Trade[] = [];
    const equityCurve: EquityPoint[] = [];
    let currentEquity = this.config.riskConfig.initialCapital;

    // Add initial equity point
    equityCurve.push({
      timestamp: this.config.startDate.getTime(),
      equity: currentEquity,
      pnl: 0
    });

    // Reset position manager
    this.positionManager.reset();

    // Iterate through each candle
    for (let i = 0; i < marketData.candles.length; i++) {
      const candle = marketData.candles[i];
      const currentPrice = candle.close;
      const currentTime = candle.timestamp;

      // Calculate volatility for slippage calculations
      const recentPrices = marketData.candles
        .slice(Math.max(0, i - 20), i + 1)
        .map(c => c.close);
      const volatility = this.costCalculator.calculateVolatility(recentPrices);

      // Get open positions
      const openPositions = this.positionManager.getOpenPositions();

      // Check exit conditions for open positions (stop loss / take profit)
      for (const position of openPositions) {
        const exitCondition = this.positionManager.checkExitConditions(position, currentPrice);
        
        if (exitCondition) {
          // Get funding rates during position lifetime
          const fundingRates = marketData.fundingRates
            .filter(fr => fr.timestamp >= position.entryTime && fr.timestamp <= currentTime)
            .map(fr => fr.rate);

          const trade = this.positionManager.closePosition(
            position.id,
            currentPrice,
            currentTime,
            exitCondition,
            fundingRates,
            volatility
          );

          if (trade) {
            trades.push(trade);
            currentEquity += trade.pnl;
            
            equityCurve.push({
              timestamp: currentTime,
              equity: currentEquity,
              pnl: trade.pnl
            });
          }
        }
      }

      // Generate signals from strategy
      const signals = this.strategy.generateSignals(marketData, i, openPositions);

      // Process signals
      for (const signal of signals) {
        if (signal.type === 'exit') {
          // Close position based on strategy signal
          const position = openPositions.find(pos => pos.coin === signal.coin);
          if (position) {
            const fundingRates = marketData.fundingRates
              .filter(fr => fr.timestamp >= position.entryTime && fr.timestamp <= currentTime)
              .map(fr => fr.rate);

            const trade = this.positionManager.closePosition(
              position.id,
              currentPrice,
              currentTime,
              'signal',
              fundingRates,
              volatility
            );

            if (trade) {
              trades.push(trade);
              currentEquity += trade.pnl;
              
              equityCurve.push({
                timestamp: currentTime,
                equity: currentEquity,
                pnl: trade.pnl
              });
            }
          }
        } else if (signal.type === 'entry') {
          // Open new position
          const { position, slippageCost } = this.positionManager.openPosition(
            signal,
            currentPrice,
            currentEquity,
            volatility
          );

          if (position) {
            console.log(`Opened ${position.side} position at ${currentPrice} (${signal.reason})`);
          }
        }
      }
    }

    // Close any remaining open positions at end of backtest
    const finalCandle = marketData.candles[marketData.candles.length - 1];
    const finalPrice = finalCandle.close;
    const finalTime = finalCandle.timestamp;
    const finalVolatility = this.costCalculator.calculateVolatility(
      marketData.candles.slice(-20).map(c => c.close)
    );

    const finalTrades = this.positionManager.closeAllPositions(
      finalPrice,
      finalTime,
      [],
      finalVolatility
    );

    trades.push(...finalTrades);
    for (const trade of finalTrades) {
      currentEquity += trade.pnl;
    }

    // Add final equity point
    equityCurve.push({
      timestamp: finalTime,
      equity: currentEquity,
      pnl: 0
    });

    // Calculate metrics
    const metrics = this.metricsCalculator.calculateMetrics(
      trades,
      equityCurve,
      this.config.riskConfig.initialCapital,
      this.config.startDate.getTime(),
      this.config.endDate.getTime()
    );

    // Calculate regime performance
    const regimePerformance = this.metricsCalculator.calculateRegimePerformance(
      trades,
      marketData.candles,
      this.config.riskConfig.initialCapital
    );

    metrics.bullPerformance = regimePerformance.bull;
    metrics.bearPerformance = regimePerformance.bear;
    metrics.sidewaysPerformance = regimePerformance.sideways;

    // Validate results
    const validation = this.validateResults(metrics);

    const endTime = Date.now();

    console.log(`Backtest completed: ${trades.length} trades, ${metrics.winRate.toFixed(1)}% win rate, ${metrics.totalPnLPercent.toFixed(2)}% return`);

    return {
      config: this.config,
      metrics,
      trades,
      equityCurve,
      validation,
      startTime,
      endTime,
      duration: endTime - startTime
    };
  }

  /**
   * Validate backtest results against red flags
   */
  private validateResults(metrics: any): ValidationResult {
    const redFlags: RedFlag[] = [];
    const warnings: Warning[] = [];
    let score = 100;

    // Check Sharpe ratio
    if (metrics.sharpeRatio > DAY_TRADING_THRESHOLDS.maxSharpe) {
      redFlags.push(RedFlag.SHARPE_TOO_HIGH);
      score -= 20;
    } else if (metrics.sharpeRatio < DAY_TRADING_THRESHOLDS.minSharpe) {
      warnings.push({
        type: 'LOW_SHARPE',
        message: `Sharpe ratio ${metrics.sharpeRatio.toFixed(2)} is below recommended ${DAY_TRADING_THRESHOLDS.minSharpe}`,
        severity: 'medium'
      });
      score -= 10;
    }

    // Check win rate
    if (metrics.winRate > DAY_TRADING_THRESHOLDS.maxWinRate) {
      redFlags.push(RedFlag.WIN_RATE_TOO_HIGH);
      score -= 20;
    } else if (metrics.winRate < DAY_TRADING_THRESHOLDS.minWinRate) {
      warnings.push({
        type: 'LOW_WIN_RATE',
        message: `Win rate ${(metrics.winRate * 100).toFixed(1)}% is below recommended ${(DAY_TRADING_THRESHOLDS.minWinRate * 100).toFixed(0)}%`,
        severity: 'medium'
      });
      score -= 10;
    }

    // Check number of trades
    if (metrics.totalTrades < DAY_TRADING_THRESHOLDS.minTrades) {
      redFlags.push(RedFlag.INSUFFICIENT_TRADES);
      score -= 25;
    }

    // Check max drawdown
    if (metrics.maxDrawdownPercent > DAY_TRADING_THRESHOLDS.maxDrawdown) {
      redFlags.push(RedFlag.MAX_DRAWDOWN_TOO_HIGH);
      score -= 15;
    }

    // Check profit factor
    if (metrics.profitFactor < DAY_TRADING_THRESHOLDS.minProfitFactor) {
      redFlags.push(RedFlag.LOW_PROFIT_FACTOR);
      score -= 15;
    }

    // Check regime performance
    const regimeFailures = [
      metrics.bullPerformance,
      metrics.bearPerformance,
      metrics.sidewaysPerformance
    ].filter(regime => regime.totalTrades > 10 && regime.profitFactor < 0.8);

    if (regimeFailures.length > 0) {
      redFlags.push(RedFlag.REGIME_FAILURE);
      score -= 20;
    }

    // Check for concentrated wins
    if (metrics.largestWin > metrics.totalPnL * 0.5 && metrics.totalTrades > 10) {
      redFlags.push(RedFlag.CONCENTRATED_WINS);
      score -= 15;
    }

    score = Math.max(0, score);

    return {
      passed: redFlags.length === 0 && score >= 70,
      redFlags,
      warnings,
      score
    };
  }
}
