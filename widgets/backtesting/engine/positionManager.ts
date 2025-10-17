import { Position, Trade, Signal, RiskConfig, CostConfig, PositionSide } from '../types';
import { CostCalculator } from './costCalculator';

export class PositionManager {
  private positions: Map<string, Position> = new Map();
  private costCalculator: CostCalculator;
  private positionIdCounter = 0;

  constructor(
    private riskConfig: RiskConfig,
    private costConfig: CostConfig
  ) {
    this.costCalculator = new CostCalculator(costConfig);
  }

  /**
   * Open a new position based on signal
   */
  openPosition(
    signal: Signal,
    currentPrice: number,
    currentEquity: number,
    volatility: number = 0
  ): { position: Position | null; slippageCost: number } {
    // Check if we can open more positions
    if (this.positions.size >= this.riskConfig.maxPositions) {
      return { position: null, slippageCost: 0 };
    }

    // Calculate position size
    const positionSize = currentEquity * (this.riskConfig.positionSize / 100);
    
    // Apply slippage to entry price
    const { adjustedPrice, slippageCost } = this.costCalculator.calculateSlippage(
      currentPrice,
      positionSize,
      signal.direction === 'long' ? 'buy' : 'sell',
      volatility
    );

    const position: Position = {
      id: `pos_${++this.positionIdCounter}`,
      coin: signal.coin,
      side: signal.direction,
      entryPrice: adjustedPrice,
      entryTime: signal.timestamp,
      size: positionSize,
      leverage: this.riskConfig.leverage,
      stopLoss: this.riskConfig.stopLoss,
      takeProfit: this.riskConfig.takeProfit,
      fundingPaid: 0
    };

    this.positions.set(position.id, position);
    
    return { position, slippageCost };
  }

  /**
   * Close an existing position
   */
  closePosition(
    positionId: string,
    exitPrice: number,
    exitTime: number,
    exitReason: Trade['exitReason'],
    fundingRates: number[],
    volatility: number = 0
  ): Trade | null {
    const position = this.positions.get(positionId);
    if (!position) return null;

    // Apply slippage to exit price
    const exitSide = position.side === 'long' ? 'sell' : 'buy';
    const { adjustedPrice: adjustedExitPrice, slippageCost } = this.costCalculator.calculateSlippage(
      exitPrice,
      position.size,
      exitSide,
      volatility
    );

    // Calculate PnL
    const pnl = this.calculatePnL(position, adjustedExitPrice);
    const pnlPercent = (pnl / position.size) * 100;

    // Calculate holding time in hours
    const holdingTime = (exitTime - position.entryTime) / (1000 * 60 * 60);

    // Calculate costs
    const fees = this.costCalculator.calculateFees(position.size, position.leverage);
    const funding = this.costCalculator.calculateFunding(position, fundingRates, holdingTime);
    const totalCost = fees + slippageCost + funding;

    const trade: Trade = {
      id: position.id,
      coin: position.coin,
      side: position.side,
      entryPrice: position.entryPrice,
      exitPrice: adjustedExitPrice,
      entryTime: position.entryTime,
      exitTime,
      size: position.size,
      leverage: position.leverage,
      pnl: pnl - totalCost,
      pnlPercent: ((pnl - totalCost) / position.size) * 100,
      fees,
      slippage: slippageCost,
      funding,
      totalCost,
      holdingTime,
      exitReason
    };

    this.positions.delete(positionId);
    
    return trade;
  }

  /**
   * Calculate unrealized PnL for open position
   */
  calculatePnL(position: Position, currentPrice: number): number {
    const priceChange = position.side === 'long'
      ? currentPrice - position.entryPrice
      : position.entryPrice - currentPrice;
    
    const pnlPercent = (priceChange / position.entryPrice) * position.leverage;
    return position.size * pnlPercent;
  }

  /**
   * Check if position should be closed due to stop loss or take profit
   */
  checkExitConditions(
    position: Position,
    currentPrice: number
  ): 'stopLoss' | 'takeProfit' | null {
    const pnl = this.calculatePnL(position, currentPrice);
    const pnlPercent = (pnl / position.size) * 100;

    if (pnlPercent <= -position.stopLoss) {
      return 'stopLoss';
    }

    if (pnlPercent >= position.takeProfit) {
      return 'takeProfit';
    }

    return null;
  }

  /**
   * Get all open positions
   */
  getOpenPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  /**
   * Get specific position
   */
  getPosition(positionId: string): Position | undefined {
    return this.positions.get(positionId);
  }

  /**
   * Check if we have an open position for a coin
   */
  hasOpenPosition(coin: string): boolean {
    return Array.from(this.positions.values()).some(pos => pos.coin === coin);
  }

  /**
   * Close all open positions (end of backtest)
   */
  closeAllPositions(
    exitPrice: number,
    exitTime: number,
    fundingRates: number[],
    volatility: number = 0
  ): Trade[] {
    const trades: Trade[] = [];
    const positionIds = Array.from(this.positions.keys());

    for (const positionId of positionIds) {
      const trade = this.closePosition(
        positionId,
        exitPrice,
        exitTime,
        'endOfPeriod',
        fundingRates,
        volatility
      );
      if (trade) {
        trades.push(trade);
      }
    }

    return trades;
  }

  /**
   * Reset position manager
   */
  reset(): void {
    this.positions.clear();
    this.positionIdCounter = 0;
  }
}
