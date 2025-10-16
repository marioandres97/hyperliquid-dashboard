import { Trade, CVDData, Signal, SignalConfirmation, SignalConfig } from './types';
import { ELITE_ORDER_FLOW_CONFIG, calculateTPSL } from './types';
import { VolumeProfileCalculator, VolumeProfileData } from './volumeProfile';

// Historial de señales por hora (para filtro de máximo 3/hora)
const signalHistory: { [coin: string]: number[] } = {
  BTC: [],
  ETH: [],
  HYPE: []
};

// Último precio por moneda (para verificar cooldown de señal opuesta)
const lastSignalType: { [coin: string]: { type: 'LONG' | 'SHORT', candle: number } | null } = {
  BTC: null,
  ETH: null,
  HYPE: null
};

let candleCounter = 0; // Contador global de candles

export class SignalEngine {
  private trades: Trade[] = [];
  private cvdHistory: CVDData[] = [];
  private config: SignalConfig;
  private vpCalculator: VolumeProfileCalculator;
  private vpData: VolumeProfileData | null = null;

  constructor(config: SignalConfig) {
    this.config = config;
    this.vpCalculator = new VolumeProfileCalculator();
  }

  addTrade(trade: Trade) {
    this.trades.push(trade);
    
    // Mantener solo últimos 5 minutos
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.trades = this.trades.filter(t => t.timestamp > fiveMinutesAgo);
    
    // Actualizar CVD
    this.updateCVD(trade);
    
    // Recalcular Volume Profile cada 10 trades
    if (this.trades.length % 10 === 0) {
      candleCounter++; // Incrementar contador de candles
      
      // Usar últimas 4 horas de trades para VP
      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
      const vpTrades = this.trades.filter(t => t.timestamp > fourHoursAgo);
      this.vpData = this.vpCalculator.calculate(vpTrades);
    }
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

  detectSignal(currentPrice: number, coin: string, hasActiveSignal: boolean): Signal | null {
    // No generar señal si ya hay una activa para esta moneda
    if (hasActiveSignal) {
      return null;
    }

    const eliteConfig = ELITE_ORDER_FLOW_CONFIG;

    // Necesitamos suficientes datos
    if (this.trades.length < 50 || this.cvdHistory.length < eliteConfig.thresholds.cvdMinCandles) {
      return null;
    }

    // ⭐ FILTROS NEGATIVOS - Si falla uno, no generar señal
    if (!this.passNegativeFilters(coin)) {
      return null;
    }

    const confirmations = this.checkConfirmations(currentPrice, coin);
    const metConfirmations = confirmations.filter(c => c.met);
    
    // ⭐ DEBE TENER 7/7 CONFIRMACIONES
    if (metConfirmations.length !== eliteConfig.minConfirmations) {
      return null;
    }

    // ⭐ VERIFICAR CALIDAD ULTRA-ESTRICTA DE CADA CONFIRMACIÓN
    if (!this.verifyUltraQuality(metConfirmations, coin)) {
      return null;
    }

    const confidence = (metConfirmations.length / confirmations.length);
    
    // ⭐ DEBE TENER >95% CONFIDENCE
    if (confidence < eliteConfig.minConfidence) {
      return null;
    }

    // Determinar dirección
    const signalType = this.determineSignalType(confirmations);
    
    if (!signalType) {
      return null;
    }

    // ⭐ VERIFICAR COOLDOWN DE SEÑAL OPUESTA
    const lastSignal = lastSignalType[coin];
    if (lastSignal && lastSignal.type !== signalType) {
      const candlesSinceOpposite = candleCounter - lastSignal.candle;
      if (candlesSinceOpposite < eliteConfig.negativeFilters.oppositeSignalCooldown) {
        return null; // Muy pronto para señal opuesta
      }
    }

    // Calcular TP/SL usando nueva función
    const { target, stop } = calculateTPSL(coin, currentPrice, signalType);

    // Registrar señal en historial
    const now = Date.now();
    if (!signalHistory[coin]) signalHistory[coin] = [];
    signalHistory[coin].push(now);
    
    // Limpiar historial >1 hora
    signalHistory[coin] = signalHistory[coin].filter(t => now - t < 3600000);
    
    // Actualizar último tipo de señal
    lastSignalType[coin] = { type: signalType, candle: candleCounter };

    const signal: Signal = {
      id: `${coin}-${Date.now()}`,
      type: signalType,
      coin,
      price: currentPrice,
      confidence: Math.round(confidence * 100),
      confirmations,
      entry: currentPrice,
      target,
      stop,
      timestamp: now,
      reasoning: this.generateReasoning(metConfirmations)
    };

    return signal;
  }

  // ⭐ FILTROS NEGATIVOS
  private passNegativeFilters(coin: string): boolean {
    const config = ELITE_ORDER_FLOW_CONFIG.negativeFilters;
    const now = Date.now();
    
    // 1. Máximo de señales por hora
    if (!signalHistory[coin]) signalHistory[coin] = [];
    signalHistory[coin] = signalHistory[coin].filter(t => now - t < 3600000);
    
    if (signalHistory[coin].length >= config.maxSignalsPerHour) {
      return false; // Ya hay 3 señales en la última hora
    }
    
    // 2. Volumen mínimo
    const recentTrades = this.trades.slice(-20);
    if (recentTrades.length < 20) return false;
    
    const avgVolume1h = this.trades.slice(-60).reduce((sum, t) => sum + (t.price * t.size), 0) / 60;
    const currentVolume = recentTrades.reduce((sum, t) => sum + (t.price * t.size), 0) / recentTrades.length;
    
    if (avgVolume1h > 0 && currentVolume < avgVolume1h * config.minVolumeRatio) {
      return false; // Volumen muy bajo
    }
    
    // 3. Trade size promedio
    const avgTradeSize = recentTrades.reduce((sum, t) => sum + (t.price * t.size), 0) / recentTrades.length;
    
    if (avgTradeSize < config.minAvgTradeSize) {
      return false; // Dominado por retail
    }
    
    return true;
  }

  // ⭐ VERIFICACIÓN DE CALIDAD ULTRA-ESTRICTA
  private verifyUltraQuality(confirmations: SignalConfirmation[], coin: string): boolean {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    
    for (const conf of confirmations) {
      switch (conf.type) {
        case 'cvd_divergence':
          if (!this.verifyCVDQuality(config)) return false;
          break;
          
        case 'aggressive_imbalance':
          if (!this.verifyImbalanceQuality(config)) return false;
          break;
          
        case 'large_order':
          if (!this.verifyLargeOrderQuality(coin, config)) return false;
          break;
          
        case 'no_liquidations':
          if (!this.verifyNoLiquidationsQuality(config)) return false;
          break;
      }
    }
    
    return true;
  }

  // Verificar calidad de CVD
  private verifyCVDQuality(config: typeof ELITE_ORDER_FLOW_CONFIG.thresholds): boolean {
    if (this.cvdHistory.length < config.cvdMinCandles) return false;
    
    const recent = this.cvdHistory.slice(-config.cvdMinCandles);
    
    // Verificar cruce de línea cero
    if (config.cvdMustCrossZero) {
      const hasPositive = recent.some(c => c.value > 0);
      const hasNegative = recent.some(c => c.value < 0);
      if (!hasPositive || !hasNegative) return false;
    }
    
    // Contar toques (cambios de dirección significativos)
    let touches = 0;
    for (let i = 1; i < recent.length - 1; i++) {
      const prev = recent[i - 1].value;
      const curr = recent[i].value;
      const next = recent[i + 1].value;
      
      // Punto de inflexión
      if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
        touches++;
      }
    }
    
    return touches >= config.cvdMinTouches;
  }

  // Verificar calidad de Imbalance
  private verifyImbalanceQuality(config: typeof ELITE_ORDER_FLOW_CONFIG.thresholds): boolean {
    const windowSize = config.imbalanceSustainedCandles;
    
    // Verificar que el imbalance esté sostenido por X candles
    for (let i = 0; i < windowSize; i++) {
      const start = this.trades.length - (i + 1) * 10;
      const end = this.trades.length - i * 10;
      const window = this.trades.slice(Math.max(0, start), end);
      
      if (window.length === 0) return false;
      
      const buyVolume = window.filter(t => t.side === 'buy').reduce((sum, t) => sum + t.size, 0);
      const sellVolume = window.filter(t => t.side === 'sell').reduce((sum, t) => sum + t.size, 0);
      const totalVolume = buyVolume + sellVolume;
      
      if (totalVolume === 0) return false;
      
      const buyRatio = buyVolume / totalVolume;
      const sellRatio = sellVolume / totalVolume;
      
      // Debe estar sostenido en la misma dirección
      if (buyRatio < config.aggressiveImbalance && sellRatio < config.aggressiveImbalance) {
        return false;
      }
    }
    
    return true;
  }

  // Verificar calidad de Large Orders
  private verifyLargeOrderQuality(coin: string, config: typeof ELITE_ORDER_FLOW_CONFIG.thresholds): boolean {
    const threshold = config.largeOrderSizes[coin as keyof typeof config.largeOrderSizes] || config.largeOrderSizes.BTC;
    const window = this.trades.slice(-config.largeOrderWindow);
    
    // Contar órdenes grandes en misma dirección
    const largeBuys = window.filter(t => t.side === 'buy' && (t.price * t.size) >= threshold);
    const largeSells = window.filter(t => t.side === 'sell' && (t.price * t.size) >= threshold);
    
    // Debe haber cluster de 3+ en una dirección
    const hasCluster = largeBuys.length >= config.largeOrderClusterMin || largeSells.length >= config.largeOrderClusterMin;
    
    // NO debe haber órdenes grandes en dirección opuesta
    const noOpposing = (largeBuys.length >= config.largeOrderClusterMin && largeSells.length === 0) ||
                       (largeSells.length >= config.largeOrderClusterMin && largeBuys.length === 0);
    
    return hasCluster && noOpposing;
  }

  // Verificar no liquidations
  private verifyNoLiquidationsQuality(config: typeof ELITE_ORDER_FLOW_CONFIG.thresholds): boolean {
    const lookback = this.trades.slice(-config.liquidationLookback);
    
    for (const trade of lookback) {
      if (trade.isLiquidation) {
        const liqSize = trade.price * trade.size;
        
        // Si es liquidación grande, verificar que hayan pasado suficientes candles
        if (liqSize >= config.largeLiquidationSize) {
          const candlesSince = this.trades.length - this.trades.indexOf(trade);
          if (candlesSince < config.largeLiquidationWait) {
            return false;
          }
        } else {
          // Cualquier liquidación en ventana normal = rechazo
          return false;
        }
      }
    }
    
    return true;
  }

  private checkConfirmations(currentPrice: number, coin: string): SignalConfirmation[] {
    const confirmations = [
      this.checkCVDDivergence(currentPrice),
      this.checkAggressiveImbalance(),
      this.checkLargeOrders(coin),
      this.checkNoLiquidations(),
    ];

    // Añadir confirmaciones de Volume Profile si hay datos
    if (this.vpData) {
      confirmations.push(
        this.checkVolumeProfilePosition(currentPrice),
        this.checkVABoundary(currentPrice),
        this.checkHVNLVN(currentPrice)
      );
    }

    return confirmations;
  }

  private checkCVDDivergence(currentPrice: number): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    
    if (this.cvdHistory.length < config.cvdMinCandles) {
      return {
        type: 'cvd_divergence',
        met: false,
        description: 'Insufficient CVD data'
      };
    }

    const recent = this.cvdHistory.slice(-config.cvdMinCandles);
    
    // Verificar divergencia básica
    let hasPositive = false;
    let hasNegative = false;
    
    for (const cvd of recent) {
      if (cvd.value > 0) hasPositive = true;
      if (cvd.value < 0) hasNegative = true;
    }
    
    const isDivergence = hasPositive && hasNegative;

    return {
      type: 'cvd_divergence',
      met: isDivergence,
      value: isDivergence ? 'Detected' : 'None',
      description: isDivergence ? `CVD divergence over ${config.cvdMinCandles}+ candles` : 'No CVD divergence'
    };
  }

  private checkAggressiveImbalance(): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    
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
    const buyRatio = (buyVolume / totalVolume);
    const sellRatio = (sellVolume / totalVolume);

    const isImbalanced = buyRatio >= config.aggressiveImbalance || 
                         sellRatio >= config.aggressiveImbalance;

    return {
      type: 'aggressive_imbalance',
      met: isImbalanced,
      value: `${buyRatio > sellRatio ? 'Buy' : 'Sell'}: ${(Math.max(buyRatio, sellRatio) * 100).toFixed(1)}%`,
      description: isImbalanced ? `Strong ${buyRatio > sellRatio ? 'buy' : 'sell'} pressure (${config.aggressiveImbalance * 100}%+)` : 'Balanced flow'
    };
  }

  private checkLargeOrders(coin: string): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    const threshold = config.largeOrderSizes[coin as keyof typeof config.largeOrderSizes] || config.largeOrderSizes.BTC;
    
    const window = this.trades.slice(-config.largeOrderWindow);
    const largeBuys = window.filter(t => t.side === 'buy' && (t.price * t.size) >= threshold);
    const largeSells = window.filter(t => t.side === 'sell' && (t.price * t.size) >= threshold);

    const hasCluster = largeBuys.length >= config.largeOrderClusterMin || largeSells.length >= config.largeOrderClusterMin;

    return {
      type: 'large_order',
      met: hasCluster,
      value: hasCluster ? `${Math.max(largeBuys.length, largeSells.length)} orders` : undefined,
      description: hasCluster ? `Cluster of ${Math.max(largeBuys.length, largeSells.length)} large orders (>${(threshold / 1000).toFixed(0)}k)` : 'No large order clusters'
    };
  }

  private checkNoLiquidations(): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    const lookback = this.trades.slice(-config.liquidationLookback);
    const hasLiquidations = lookback.some(t => t.isLiquidation);

    return {
      type: 'no_liquidations',
      met: !hasLiquidations,
      description: !hasLiquidations ? `No liquidations in last ${config.liquidationLookback} candles` : 'Recent liquidations detected'
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

  private checkVolumeProfilePosition(currentPrice: number): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    
    if (!this.vpData) {
      return {
        type: 'hvn_lvn',
        met: false,
        description: 'No VP data available'
      };
    }

    const position = this.vpCalculator.analyzePricePosition(currentPrice, this.vpData);

    if (position.nearPOC) {
      return {
        type: 'hvn_lvn',
        met: true,
        value: `POC`,
        description: `Price within ${config.pocMaxDistance} bin(s) of POC`
      };
    }

    return {
      type: 'hvn_lvn',
      met: false,
      description: 'Price not near POC'
    };
  }

  private checkVABoundary(currentPrice: number): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    
    if (!this.vpData) {
      return {
        type: 'wall_broken',
        met: false,
        description: 'No VP data'
      };
    }

    
    const precision = config.vaBoundaryPrecision;

    const atVAH = Math.abs(currentPrice - this.vpData.vah) / currentPrice <= precision;
    const atVAL = Math.abs(currentPrice - this.vpData.val) / currentPrice <= precision;

    if (atVAH || atVAL) {
      return {
        type: 'wall_broken',
        met: true,
        value: atVAH ? 'At VAH' : 'At VAL',
        description: `Price at ${atVAH ? 'VAH' : 'VAL'} boundary (±${(precision * 100).toFixed(2)}%)`
      };
    }

    return {
      type: 'wall_broken',
      met: false,
      description: 'Price not at VA boundary'
    };
  }

  private checkHVNLVN(currentPrice: number): SignalConfirmation {
    const config = ELITE_ORDER_FLOW_CONFIG.thresholds;
    
    if (!this.vpData) {
      return {
        type: 'hvn_lvn',
        met: false,
        description: 'No VP data'
      };
    }

    const position = this.vpCalculator.analyzePricePosition(currentPrice, this.vpData);

    if (position.atHVN) {
      return {
        type: 'hvn_lvn',
        met: true,
        value: 'At HVN',
        description: `Price at HVN (${config.hvnMinRatio}x ratio)`
      };
    }

    if (position.atLVN) {
      return {
        type: 'hvn_lvn',
        met: true,
        value: 'At LVN',
        description: `Price at LVN (${config.lvnMaxRatio}x ratio)`
      };
    }

    return {
      type: 'hvn_lvn',
      met: false,
      description: 'Price not at HVN/LVN'
    };
  }
}