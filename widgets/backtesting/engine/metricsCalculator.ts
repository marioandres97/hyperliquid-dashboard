import { Trade, BacktestMetrics, RegimeStats, EquityPoint, Candle, MarketRegime } from '../types';

export class MetricsCalculator {
  /**
   * Calculate complete backtest metrics from trades
   */
  calculateMetrics(
    trades: Trade[],
    equityCurve: EquityPoint[],
    initialCapital: number,
    startTime: number,
    endTime: number
  ): BacktestMetrics {
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalFees = trades.reduce((sum, t) => sum + t.fees, 0);
    const totalSlippage = trades.reduce((sum, t) => sum + t.slippage, 0);
    const totalFunding = trades.reduce((sum, t) => sum + t.funding, 0);
    
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;
    
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
      : 0;

    const largestWin = winningTrades.length > 0
      ? Math.max(...winningTrades.map(t => t.pnl))
      : 0;
    
    const largestLoss = losingTrades.length > 0
      ? Math.abs(Math.min(...losingTrades.map(t => t.pnl)))
      : 0;

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);

    const { maxDrawdown, maxDrawdownPercent, maxDrawdownDuration } = this.calculateDrawdown(
      equityCurve,
      initialCapital
    );

    const sharpeRatio = this.calculateSharpeRatio(equityCurve, initialCapital);
    const sortinoRatio = this.calculateSortinoRatio(equityCurve, initialCapital);
    const calmarRatio = totalPnL > 0 && maxDrawdownPercent > 0
      ? (totalPnL / initialCapital) / maxDrawdownPercent
      : 0;

    const { winStreak, lossStreak } = this.calculateStreaks(trades);

    const avgHoldingTime = trades.length > 0
      ? trades.reduce((sum, t) => sum + t.holdingTime, 0) / trades.length
      : 0;

    const expectancy = trades.length > 0 ? totalPnL / trades.length : 0;
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? winningTrades.length / trades.length : 0,
      totalPnL,
      totalPnLPercent: (totalPnL / initialCapital) * 100,
      
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      maxDrawdown,
      maxDrawdownPercent,
      maxDrawdownDuration,
      
      profitFactor,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      avgWinPercent: avgWin > 0 ? (avgWin / initialCapital) * 100 : 0,
      avgLossPercent: avgLoss > 0 ? (avgLoss / initialCapital) * 100 : 0,
      
      winStreak,
      lossStreak,
      avgHoldingTime,
      
      totalFees,
      totalSlippage,
      totalFunding,
      totalCosts: totalFees + totalSlippage + totalFunding,
      
      // Regime performance - calculated separately
      bullPerformance: { totalPnL: 0, totalPnLPercent: 0, totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, sharpeRatio: 0 },
      bearPerformance: { totalPnL: 0, totalPnLPercent: 0, totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, sharpeRatio: 0 },
      sidewaysPerformance: { totalPnL: 0, totalPnLPercent: 0, totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, sharpeRatio: 0 },
      
      expectancy,
      riskRewardRatio
    };
  }

  /**
   * Calculate Sharpe Ratio (annualized)
   * Assumes 365 days per year, 24/7 trading
   */
  calculateSharpeRatio(equityCurve: EquityPoint[], initialCapital: number): number {
    if (equityCurve.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const ret = (equityCurve[i].equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity;
      returns.push(ret);
    }

    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    // Annualize (assuming daily equity points)
    const sharpe = (avgReturn / stdDev) * Math.sqrt(365);
    
    return sharpe;
  }

  /**
   * Calculate Sortino Ratio (only penalizes downside volatility)
   */
  calculateSortinoRatio(equityCurve: EquityPoint[], initialCapital: number): number {
    if (equityCurve.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const ret = (equityCurve[i].equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity;
      returns.push(ret);
    }

    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    // Calculate downside deviation (only negative returns)
    const negativeReturns = returns.filter(r => r < 0);
    if (negativeReturns.length === 0) return avgReturn > 0 ? 999 : 0;

    const downsideVariance = negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length;
    const downsideStdDev = Math.sqrt(downsideVariance);

    if (downsideStdDev === 0) return 0;

    // Annualize
    const sortino = (avgReturn / downsideStdDev) * Math.sqrt(365);
    
    return sortino;
  }

  /**
   * Calculate maximum drawdown
   */
  calculateDrawdown(
    equityCurve: EquityPoint[],
    initialCapital: number
  ): { maxDrawdown: number; maxDrawdownPercent: number; maxDrawdownDuration: number } {
    if (equityCurve.length === 0) {
      return { maxDrawdown: 0, maxDrawdownPercent: 0, maxDrawdownDuration: 0 };
    }

    let maxEquity = initialCapital;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let currentDrawdownStart = 0;
    let maxDrawdownDuration = 0;

    for (let i = 0; i < equityCurve.length; i++) {
      const equity = equityCurve[i].equity;
      
      if (equity > maxEquity) {
        maxEquity = equity;
        currentDrawdownStart = i;
      } else {
        const drawdown = maxEquity - equity;
        const drawdownPercent = drawdown / maxEquity;
        
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
          maxDrawdownPercent = drawdownPercent;
          
          // Calculate duration in days
          const duration = (equityCurve[i].timestamp - equityCurve[currentDrawdownStart].timestamp) 
            / (1000 * 60 * 60 * 24);
          maxDrawdownDuration = Math.max(maxDrawdownDuration, duration);
        }
      }
    }

    return { maxDrawdown, maxDrawdownPercent, maxDrawdownDuration };
  }

  /**
   * Calculate win/loss streaks
   */
  calculateStreaks(trades: Trade[]): { winStreak: number; lossStreak: number } {
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    for (const trade of trades) {
      if (trade.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    }

    return { winStreak: maxWinStreak, lossStreak: maxLossStreak };
  }

  /**
   * Identify market regime based on price trend
   */
  identifyRegime(candles: Candle[], startIndex: number, lookback: number = 20): MarketRegime {
    if (startIndex < lookback) return 'sideways';

    const recentCandles = candles.slice(startIndex - lookback, startIndex);
    const firstPrice = recentCandles[0].close;
    const lastPrice = recentCandles[recentCandles.length - 1].close;
    const priceChange = (lastPrice - firstPrice) / firstPrice;

    // Calculate price volatility
    const returns = [];
    for (let i = 1; i < recentCandles.length; i++) {
      const ret = (recentCandles[i].close - recentCandles[i - 1].close) / recentCandles[i - 1].close;
      returns.push(Math.abs(ret));
    }
    const avgVolatility = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Bull: strong uptrend (>5% in lookback period)
    if (priceChange > 0.05 && avgVolatility < 0.03) {
      return 'bull';
    }
    
    // Bear: strong downtrend (<-5% in lookback period)
    if (priceChange < -0.05 && avgVolatility < 0.03) {
      return 'bear';
    }
    
    // Sideways: choppy or ranging
    return 'sideways';
  }

  /**
   * Calculate regime-specific performance
   */
  calculateRegimePerformance(
    trades: Trade[],
    candles: Candle[],
    initialCapital: number
  ): { bull: RegimeStats; bear: RegimeStats; sideways: RegimeStats } {
    const regimeMap = new Map<MarketRegime, Trade[]>();
    regimeMap.set('bull', []);
    regimeMap.set('bear', []);
    regimeMap.set('sideways', []);

    // Classify each trade by regime
    for (const trade of trades) {
      // Find candle index at trade entry time
      const candleIndex = candles.findIndex(c => c.timestamp >= trade.entryTime);
      if (candleIndex >= 0) {
        const regime = this.identifyRegime(candles, candleIndex);
        regimeMap.get(regime)!.push(trade);
      }
    }

    const calculateStats = (regimeTrades: Trade[]): RegimeStats => {
      if (regimeTrades.length === 0) {
        return {
          totalPnL: 0,
          totalPnLPercent: 0,
          totalTrades: 0,
          winRate: 0,
          avgWin: 0,
          avgLoss: 0,
          profitFactor: 0,
          sharpeRatio: 0
        };
      }

      const wins = regimeTrades.filter(t => t.pnl > 0);
      const losses = regimeTrades.filter(t => t.pnl <= 0);
      const totalPnL = regimeTrades.reduce((sum, t) => sum + t.pnl, 0);
      const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
      const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

      return {
        totalPnL,
        totalPnLPercent: (totalPnL / initialCapital) * 100,
        totalTrades: regimeTrades.length,
        winRate: wins.length / regimeTrades.length,
        avgWin: wins.length > 0 ? grossProfit / wins.length : 0,
        avgLoss: losses.length > 0 ? grossLoss / losses.length : 0,
        profitFactor: grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0),
        sharpeRatio: 0 // Could calculate if needed
      };
    };

    return {
      bull: calculateStats(regimeMap.get('bull')!),
      bear: calculateStats(regimeMap.get('bear')!),
      sideways: calculateStats(regimeMap.get('sideways')!)
    };
  }
}
