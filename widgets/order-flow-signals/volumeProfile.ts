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
  private binSize: number;

  constructor(binSize: number = 100) {
    this.binSize = binSize;
  }

  calculate(trades: Trade[]): VolumeProfileData | null {
    if (trades.length < 50) {
      return null;
    }

    // Agrupar trades por price bins
    const priceMap = new Map<number, { buy: number; sell: number }>();
    
    trades.forEach(trade => {
      const binPrice = Math.round(trade.price / this.binSize) * this.binSize;
      
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

    // Convertir a array y ordenar
    const levels: VolumeProfileLevel[] = Array.from(priceMap.entries())
      .map(([price, volumes]) => ({
        price,
        volume: volumes.buy + volumes.sell,
        buyVolume: volumes.buy,
        sellVolume: volumes.sell
      }))
      .sort((a, b) => b.price - a.price);

    if (levels.length === 0) {
      return null;
    }

    const totalVolume = levels.reduce((sum, level) => sum + level.volume, 0);

    // Calcular POC (Point of Control)
    const poc = levels.reduce((max, level) => 
      level.volume > max.volume ? level : max
    ).price;

    // Calcular Value Area (70% del volumen)
    const { vah, val } = this.calculateValueArea(levels, totalVolume);

    // Detectar HVN y LVN
    const { hvnLevels, lvnLevels } = this.detectNodes(levels);

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

  private calculateValueArea(
    levels: VolumeProfileLevel[],
    totalVolume: number
  ): { vah: number; val: number } {
    const targetVolume = totalVolume * 0.7;
    
    // Encontrar POC
    const pocLevel = levels.reduce((max, level) => 
      level.volume > max.volume ? level : max
    );
    const pocIndex = levels.indexOf(pocLevel);

    let accumulatedVolume = pocLevel.volume;
    let upperIndex = pocIndex;
    let lowerIndex = pocIndex;

    // Expandir desde POC hasta acumular 70% del volumen
    while (accumulatedVolume < targetVolume) {
      const upperVolume = upperIndex > 0 ? levels[upperIndex - 1].volume : 0;
      const lowerVolume = lowerIndex < levels.length - 1 ? levels[lowerIndex + 1].volume : 0;

      if (upperVolume >= lowerVolume && upperIndex > 0) {
        upperIndex--;
        accumulatedVolume += levels[upperIndex].volume;
      } else if (lowerIndex < levels.length - 1) {
        lowerIndex++;
        accumulatedVolume += levels[lowerIndex].volume;
      } else {
        break;
      }
    }

    return {
      vah: levels[upperIndex].price,
      val: levels[lowerIndex].price
    };
  }

  private detectNodes(levels: VolumeProfileLevel[]): {
    hvnLevels: number[];
    lvnLevels: number[];
  } {
    if (levels.length < 3) {
      return { hvnLevels: [], lvnLevels: [] };
    }

    const avgVolume = levels.reduce((sum, l) => sum + l.volume, 0) / levels.length;
    const hvnThreshold = avgVolume * 1.5;
    const lvnThreshold = avgVolume * 0.3;

    const hvnLevels: number[] = [];
    const lvnLevels: number[] = [];

    // Detectar picos (HVN) y valles (LVN)
    for (let i = 1; i < levels.length - 1; i++) {
      const current = levels[i];
      const prev = levels[i - 1];
      const next = levels[i + 1];

      // HVN: Pico local con volumen alto
      if (current.volume > prev.volume && 
          current.volume > next.volume && 
          current.volume > hvnThreshold) {
        hvnLevels.push(current.price);
      }

      // LVN: Valle local con volumen bajo
      if (current.volume < prev.volume && 
          current.volume < next.volume && 
          current.volume < lvnThreshold) {
        lvnLevels.push(current.price);
      }
    }

    return { hvnLevels, lvnLevels };
  }

  // Helper: Determinar relación del precio con VP
  analyzePricePosition(price: number, vpData: VolumeProfileData): {
    nearPOC: boolean;
    atVAH: boolean;
    atVAL: boolean;
    insideVA: boolean;
    nearHVN: boolean;
    nearLVN: boolean;
    distance: {
      fromPOC: number;
      fromVAH: number;
      fromVAL: number;
    };
  } {
    const pocDistance = Math.abs(price - vpData.poc);
    const pocTolerance = vpData.poc * 0.01; // 1%

    const vahDistance = Math.abs(price - vpData.vah);
    const valDistance = Math.abs(price - vpData.val);
    const vaTolerance = vpData.vah * 0.005; // 0.5%

    const nearHVN = vpData.hvnLevels.some(hvn => 
      Math.abs(price - hvn) < hvn * 0.01
    );

    const nearLVN = vpData.lvnLevels.some(lvn => 
      Math.abs(price - lvn) < lvn * 0.01
    );

    return {
      nearPOC: pocDistance < pocTolerance,
      atVAH: vahDistance < vaTolerance,
      atVAL: valDistance < vaTolerance,
      insideVA: price <= vpData.vah && price >= vpData.val,
      nearHVN,
      nearLVN,
      distance: {
        fromPOC: ((price - vpData.poc) / vpData.poc) * 100,
        fromVAH: ((price - vpData.vah) / vpData.vah) * 100,
        fromVAL: ((price - vpData.val) / vpData.val) * 100
      }
    };
  }
}