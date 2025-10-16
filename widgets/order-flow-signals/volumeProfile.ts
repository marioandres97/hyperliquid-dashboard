import { Trade } from './types';

export interface VolumeProfileLevel {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
}

export interface VolumeProfileData {
  levels: VolumeProfileLevel[];
  poc: number; // Point of Control
  vah: number; // Value Area High
  val: number; // Value Area Low
  totalVolume: number;
  hvnLevels: number[]; // High Volume Nodes
  lvnLevels: number[]; // Low Volume Nodes
}

export class VolumeProfileCalculator {
  constructor() {
    // Sin parámetros
  }

  private getBinSize(price: number): number {
    if (price < 100) return 1;      // HYPE, monedas baratas
    if (price < 1000) return 10;    // ETH rango medio
    return 100;                      // BTC, monedas caras
  }

  calculate(trades: Trade[]): VolumeProfileData | null {
    if (trades.length < 50) {
      return null;
    }

    // Calcular binSize basado en el precio actual
    const currentPrice = trades[trades.length - 1].price;
    const binSize = this.getBinSize(currentPrice);

    // Agrupar trades por price bins
    const priceMap = new Map<number, { buy: number; sell: number }>();

    trades.forEach(trade => {
      const binPrice = Math.round(trade.price / binSize) * binSize;

      if (!priceMap.has(binPrice)) {
        priceMap.set(binPrice, { buy: 0, sell: 0 });
      }

      const bin = priceMap.get(binPrice)!;
      if (trade.side === 'buy') {
        bin.buy += trade.size;
      } else {
        bin.sell += trade.size;
      }
    });

    // Convertir a array y ordenar por volumen
    const levels: VolumeProfileLevel[] = Array.from(priceMap.entries())
      .map(([price, { buy, sell }]) => ({
        price,
        volume: buy + sell,
        buyVolume: buy,
        sellVolume: sell
      }))
      .sort((a, b) => b.volume - a.volume);

    if (levels.length === 0) return null;

    // Calcular métricas
    const totalVolume = levels.reduce((sum, level) => sum + level.volume, 0);
    const poc = levels[0].price; // Precio con mayor volumen

    // Calcular Value Area (70% del volumen)
    const targetVolume = totalVolume * 0.7;
    let accumulatedVolume = levels[0].volume;
    let vaLevels = [levels[0]];

    for (let i = 1; i < levels.length && accumulatedVolume < targetVolume; i++) {
      vaLevels.push(levels[i]);
      accumulatedVolume += levels[i].volume;
    }

    const vaPrices = vaLevels.map(l => l.price).sort((a, b) => a - b);
    const vah = vaPrices[vaPrices.length - 1];
    const val = vaPrices[0];

    // Identificar HVN y LVN
    const avgVolume = totalVolume / levels.length;
    const hvnLevels = levels
      .filter(l => l.volume > avgVolume * 1.5)
      .map(l => l.price);
    
    const lvnLevels = levels
      .filter(l => l.volume < avgVolume * 0.5)
      .map(l => l.price);

    return {
      levels,
      poc,
      vah,
      val,
      totalVolume,
      hvnLevels,
      lvnLevels
    };
  }

  // Analizar posición del precio actual respecto al VP
  analyzePricePosition(price: number, vpData: VolumeProfileData): {
    nearPOC: boolean;
    atVABoundary: boolean;
    atHVN: boolean;
    atLVN: boolean;
  } {
    const pocDistance = Math.abs(price - vpData.poc) / vpData.poc;
    const nearPOC = pocDistance < 0.002; // Dentro del 0.2%

    const atVAH = Math.abs(price - vpData.vah) / price < 0.002;
    const atVAL = Math.abs(price - vpData.val) / price < 0.002;
    const atVABoundary = atVAH || atVAL;

    const atHVN = vpData.hvnLevels.some(hvn => 
      Math.abs(price - hvn) / price < 0.002
    );

    const atLVN = vpData.lvnLevels.some(lvn => 
      Math.abs(price - lvn) / price < 0.002
    );

    return { nearPOC, atVABoundary, atHVN, atLVN };
  }
}