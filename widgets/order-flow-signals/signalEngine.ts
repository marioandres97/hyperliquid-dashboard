import { Trade, CVDData, Signal, SignalConfirmation, SignalConfig } from './types';

export class SignalEngine {
  private trades: Trade[] = [];
  private cvdHistory: CVDData[] = [];
  private lastSignalTime: number = 0;
  private config: SignalConfig;

  constructor(config: SignalConfig) {
    this.config = config;
  }

  addTrade(trade: Trade) {
    this.trades.push(trade);
    
    // Mantener solo últimos 5 minutos
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.trades = this.trades.filter(t => t.timestamp > fiveMinutesAgo);
    
    // Actualizar CVD
    this.updateCVD(trade);
  }

  private updateCVD(trade: Trade) {
    const lastCVD = this.cvdHistory[this.cvdHistory.length - 1];
    const lastValue = lastCVD ? lastCVD.value : 0;
    const lastBuyVol = lastCVD ? lastCVD.buyVolume : 0;
    const lastSellVol = lastCVD ? lastCVD.sellVolume : 0;

    const delta = trade.side === 'buy' ? trade.size : -trade.size;
    
    this.cvdHistory.push({
      value: lastValue + delta,
      timestamp: trade.timestamp,
      buyVolume: trade.side === 'buy' ? lastBuyVol + trade.size : lastBuyVol,
      sellVolume: trade.side === 'sell' ? lastSellVol + trade.size : lastSellVol
    });

    // Mantener últimos 15 minutos de CVD
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    this.cvdHistory = this.cvdHistory.filter(c => c.timestamp > fifteenMinutesAgo);
  }

  detectSignal(currentPrice: number, coin: string): Signal | null {
    // Cooldown check
    if (Date.now() - this.lastSignalTime < this.config.cooldownMs) {
      return null;
    }

    // Necesitamos suficientes datos
    if (this.trades.length < 50 || this.cvdHistory.length < 20) {
      return null;
    }

    const confirmations = this.checkConfirmations(currentPrice);
    const metConfirmations = confirmations.filter(c => c.met);
    
    // Necesitamos mínimo de confirmaciones
    if (metConfirmations.length < this.config.minConfirmations) {
      return null;
    }

    const confidence = (metConfirmations.length / confirmations.length) * 100;
    
    if (confidence < this.config.minConfidence) {
      return null;
    }

    // Determinar dirección
    const signalType = this.determineSignalType(confirmations);
    
    if (!signalType) {
      return null;
    }

    // Calcular entry, target, stop
    const riskRewardRatio = 2;
    const stopDistance = currentPrice * 0.0015; // 0.15%
    const targetDistance = stopDistance * riskRewardRatio;

    const signal: Signal = {
      id: `${coin}-${Date.now()}`,
      type: signalType,
      coin,
      price: currentPrice,
      confidence: Math.round(confidence),
      confirmations,
      entry: currentPrice,
      target: signalType === 'LONG' ? currentPrice + targetDistance : currentPrice - targetDistance,
      stop: signalType === 'LONG' ? currentPrice - stopDistance : currentPrice + stopDistance,
      timestamp: Date.now(),
      reasoning: this.generateReasoning(metConfirmations)
    };

    this.lastSignalTime = Date.now();
    return signal;
  }

  private checkConfirmations(currentPrice: number): SignalConfirmation[] {
    return [
      this.checkCVDDivergence(currentPrice),
      this.checkAggressiveImbalance(),
      this.checkLargeOrders(),
      this.checkNoLiquidations(),
    ];
  }

  private checkCVDDivergence(currentPrice: number): SignalConfirmation {
    if (this.cvdHistory.length < 20) {
      return {
        type: 'cvd_divergence',
        met: false,
        description: 'Insufficient data'
      };
    }

    // Comparar últimos 2 minutos vs 2 minutos anteriores
    const now = Date.now();
    const twoMinutesAgo = now - 2 * 60 * 1000;
    const fourMinutesAgo = now - 4 * 60 * 1000;

    const recentCVD = this.cvdHistory.filter(c => c.timestamp > twoMinutesAgo);
    const olderCVD = this.cvdHistory.filter(c => c.timestamp > fourMinutesAgo && c.timestamp <= twoMinutesAgo);

    if (recentCVD.length < 5 || olderCVD.length < 5) {
      return {
        type: 'cvd_divergence',
        met: false,
        description: 'Insufficient CVD data'
      };
    }

    const recentCVDChange = recentCVD[recentCVD.length - 1].value - recentCVD[0].value;
    const olderCVDChange = olderCVD[olderCVD.length - 1].value - olderCVD[0].value;

    // Divergencia: CVD cambiando de dirección mientras precio lateral/opuesto
    const isDivergence = Math.abs(recentCVDChange - olderCVDChange) > Math.abs(olderCVDChange) * 0.5;

    return {
      type: 'cvd_divergence',
      met: isDivergence,
      value: `${recentCVDChange > 0 ? '+' : ''}${recentCVDChange.toFixed(2)}`,
      description: isDivergence ? 'CVD Divergence detected' : 'No CVD divergence'
    };
  }

  private checkAggressiveImbalance(): SignalConfirmation {
    // Últimos 2 minutos
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const recentTrades = this.trades.filter(t => t.timestamp > twoMinutesAgo);

    if (recentTrades.length < 20) {
      return {
        type: 'aggressive_imbalance',
        met: false,
        description: 'Insufficient trades'
      };
    }

    const buyVolume = recentTrades
      .filter(t => t.side === 'buy')
      .reduce((sum, t) => sum + t.size, 0);
    
    const sellVolume = recentTrades
      .filter(t => t.side === 'sell')
      .reduce((sum, t) => sum + t.size, 0);

    const totalVolume = buyVolume + sellVolume;
    const buyRatio = (buyVolume / totalVolume) * 100;
    const sellRatio = (sellVolume / totalVolume) * 100;

    const isImbalanced = buyRatio > this.config.aggressiveImbalanceThreshold || 
                         sellRatio > this.config.aggressiveImbalanceThreshold;

    return {
      type: 'aggressive_imbalance',
      met: isImbalanced,
      value: `${buyRatio > sellRatio ? 'Buy' : 'Sell'}: ${Math.max(buyRatio, sellRatio).toFixed(1)}%`,
      description: isImbalanced ? `Strong ${buyRatio > sellRatio ? 'buy' : 'sell'} pressure` : 'Balanced flow'
    };
  }

  private checkLargeOrders(): SignalConfirmation {
    const thirtySecondsAgo = Date.now() - 30 * 1000;
    const recentLargeOrders = this.trades.filter(
      t => t.timestamp > thirtySecondsAgo && (t.isLarge || t.size * t.price > this.config.largeOrderThreshold)
    );

    const hasLargeOrders = recentLargeOrders.length > 0;

    return {
      type: 'large_order',
      met: hasLargeOrders,
      value: hasLargeOrders ? `${recentLargeOrders.length} whale(s)` : undefined,
      description: hasLargeOrders ? `Large order(s) detected` : 'No large orders'
    };
  }

  private checkNoLiquidations(): SignalConfirmation {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentLiquidations = this.trades.filter(
      t => t.timestamp > oneMinuteAgo && t.isLiquidation
    );

    const noLiquidations = recentLiquidations.length === 0;

    return {
      type: 'no_liquidations',
      met: noLiquidations,
      description: noLiquidations ? 'No recent liquidations' : `${recentLiquidations.length} liquidations detected`
    };
  }

  private determineSignalType(confirmations: SignalConfirmation[]): 'LONG' | 'SHORT' | null {
    const imbalance = confirmations.find(c => c.type === 'aggressive_imbalance' && c.met);
    
    if (!imbalance || !imbalance.value) {
      return null;
    }

    const isBuyPressure = String(imbalance.value).startsWith('Buy');
    return isBuyPressure ? 'LONG' : 'SHORT';
  }

  private generateReasoning(confirmations: SignalConfirmation[]): string {
    return confirmations.map(c => c.description).join(' • ');
  }

  reset() {
    this.trades = [];
    this.cvdHistory = [];
  }
}