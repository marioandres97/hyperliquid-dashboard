import { PnLEntry, PnLStats } from '@/types/pnl';

const POSITION_SIZE_USD = 100;

export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  type: 'LONG' | 'SHORT',
  partialPercent: number = 100
): { pnlPercent: number; pnlUsd: number } {
  let pnlPercent: number;
  
  if (type === 'LONG') {
    pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    pnlPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
  }
  
  const pnlUsd = (POSITION_SIZE_USD * pnlPercent / 100) * (partialPercent / 100);
  
  return { pnlPercent, pnlUsd };
}

export function calculatePnLStats(entries: PnLEntry[]): PnLStats {
  if (entries.length === 0) {
    return {
      totalPnL: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
      byTimeframe: {
        today: 0,
        week: 0,
        month: 0
      },
      bySignalType: {
        LONG: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalPnL: 0
        },
        SHORT: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalPnL: 0
        }
      },
      equityCurve: []
    };
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const todayStart = now - dayMs;
  const weekStart = now - (7 * dayMs);
  const monthStart = now - (30 * dayMs);

  let totalPnL = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let largestWin = 0;
  let largestLoss = 0;
  
  let todayPnL = 0;
  let weekPnL = 0;
  let monthPnL = 0;

  // Stats by signal type
  const longStats = {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: 0
  };
  
  const shortStats = {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalPnL: 0
  };

  // Sort entries by timestamp for equity curve
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  
  // Build equity curve
  const equityCurve: Array<{ timestamp: number; equity: number; pnl: number }> = [];
  let cumulativeEquity = POSITION_SIZE_USD;

  sortedEntries.forEach(entry => {
    totalPnL += entry.pnlUsd;
    
    if (entry.pnlUsd > 0) {
      winningTrades++;
      totalWins += entry.pnlUsd;
      largestWin = Math.max(largestWin, entry.pnlUsd);
    } else {
      losingTrades++;
      totalLosses += Math.abs(entry.pnlUsd);
      largestLoss = Math.min(largestLoss, entry.pnlUsd);
    }

    if (entry.timestamp >= todayStart) {
      todayPnL += entry.pnlUsd;
    }
    if (entry.timestamp >= weekStart) {
      weekPnL += entry.pnlUsd;
    }
    if (entry.timestamp >= monthStart) {
      monthPnL += entry.pnlUsd;
    }

    // Track by signal type
    if (entry.type === 'LONG') {
      longStats.totalTrades++;
      longStats.totalPnL += entry.pnlUsd;
      if (entry.pnlUsd > 0) {
        longStats.winningTrades++;
      } else {
        longStats.losingTrades++;
      }
    } else if (entry.type === 'SHORT') {
      shortStats.totalTrades++;
      shortStats.totalPnL += entry.pnlUsd;
      if (entry.pnlUsd > 0) {
        shortStats.winningTrades++;
      } else {
        shortStats.losingTrades++;
      }
    }

    // Update equity curve
    cumulativeEquity += entry.pnlUsd;
    equityCurve.push({
      timestamp: entry.timestamp,
      equity: cumulativeEquity,
      pnl: entry.pnlUsd
    });
  });

  const totalTrades = entries.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

  return {
    totalPnL,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    largestWin,
    largestLoss,
    byTimeframe: {
      today: todayPnL,
      week: weekPnL,
      month: monthPnL
    },
    bySignalType: {
      LONG: {
        totalTrades: longStats.totalTrades,
        winningTrades: longStats.winningTrades,
        losingTrades: longStats.losingTrades,
        winRate: longStats.totalTrades > 0 
          ? (longStats.winningTrades / longStats.totalTrades) * 100 
          : 0,
        totalPnL: longStats.totalPnL
      },
      SHORT: {
        totalTrades: shortStats.totalTrades,
        winningTrades: shortStats.winningTrades,
        losingTrades: shortStats.losingTrades,
        winRate: shortStats.totalTrades > 0 
          ? (shortStats.winningTrades / shortStats.totalTrades) * 100 
          : 0,
        totalPnL: shortStats.totalPnL
      }
    },
    equityCurve
  };
}

export function savePnLEntry(entry: PnLEntry): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('pnl_entries');
  const entries: PnLEntry[] = stored ? JSON.parse(stored) : [];
  entries.push(entry);
  localStorage.setItem('pnl_entries', JSON.stringify(entries));
}

export function getPnLEntries(): PnLEntry[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('pnl_entries');
  return stored ? JSON.parse(stored) : [];
}

export function clearPnLEntries(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pnl_entries');
}
