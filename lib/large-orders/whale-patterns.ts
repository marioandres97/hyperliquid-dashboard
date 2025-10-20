import type { LargeOrder } from '@/types/large-orders';

export interface WhalePattern {
  id: string;
  type: 'accumulation' | 'distribution' | 'spike' | 'multiple_large';
  timestamp: number;
  coin: string;
  orders: LargeOrder[];
  totalVolume: number;
  avgSize: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Detect multiple large orders in short time window (5 minutes)
 */
export function detectMultipleLargeOrders(orders: LargeOrder[]): WhalePattern[] {
  const patterns: WhalePattern[] = [];
  const timeWindow = 5 * 60 * 1000; // 5 minutes
  const minOrders = 3;
  const minTotalVolume = 2000000; // $2M
  
  // Group orders by coin and time window
  const coinGroups = new Map<string, LargeOrder[]>();
  
  orders.forEach(order => {
    if (!coinGroups.has(order.coin)) {
      coinGroups.set(order.coin, []);
    }
    coinGroups.get(order.coin)!.push(order);
  });
  
  // Check each coin for patterns
  coinGroups.forEach((coinOrders, coin) => {
    // Sort by timestamp
    const sorted = [...coinOrders].sort((a, b) => b.timestamp - a.timestamp);
    
    // Sliding window to find clusters
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].timestamp;
      const windowEnd = windowStart - timeWindow;
      
      const windowOrders = sorted.filter(
        o => o.timestamp >= windowEnd && o.timestamp <= windowStart
      );
      
      if (windowOrders.length >= minOrders) {
        const totalVolume = windowOrders.reduce((sum, o) => sum + o.usdValue, 0);
        
        if (totalVolume >= minTotalVolume) {
          const avgSize = totalVolume / windowOrders.length;
          const buys = windowOrders.filter(o => o.side === 'BUY').length;
          const sells = windowOrders.filter(o => o.side === 'SELL').length;
          
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (totalVolume >= 10000000) severity = 'critical';
          else if (totalVolume >= 5000000) severity = 'high';
          else if (totalVolume >= 3000000) severity = 'medium';
          
          patterns.push({
            id: `multiple-${coin}-${windowStart}`,
            type: 'multiple_large',
            timestamp: windowStart,
            coin,
            orders: windowOrders,
            totalVolume,
            avgSize,
            description: `${windowOrders.length} large orders (${buys} buys, ${sells} sells) in 5min`,
            severity,
          });
          
          // Skip overlapping windows
          i += windowOrders.length - 1;
        }
      }
    }
  });
  
  return patterns;
}

/**
 * Detect accumulation pattern (consistent buying over time)
 */
export function detectAccumulation(orders: LargeOrder[]): WhalePattern[] {
  const patterns: WhalePattern[] = [];
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  const minOrders = 5;
  const minBuyRatio = 0.75; // 75% buys
  
  // Group by coin
  const coinGroups = new Map<string, LargeOrder[]>();
  
  orders.forEach(order => {
    if (!coinGroups.has(order.coin)) {
      coinGroups.set(order.coin, []);
    }
    coinGroups.get(order.coin)!.push(order);
  });
  
  coinGroups.forEach((coinOrders, coin) => {
    const sorted = [...coinOrders].sort((a, b) => b.timestamp - a.timestamp);
    
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].timestamp;
      const windowEnd = windowStart - timeWindow;
      
      const windowOrders = sorted.filter(
        o => o.timestamp >= windowEnd && o.timestamp <= windowStart
      );
      
      if (windowOrders.length >= minOrders) {
        const buys = windowOrders.filter(o => o.side === 'BUY');
        const buyRatio = buys.length / windowOrders.length;
        
        if (buyRatio >= minBuyRatio) {
          const totalVolume = windowOrders.reduce((sum, o) => sum + o.usdValue, 0);
          const avgSize = totalVolume / windowOrders.length;
          
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
          if (totalVolume >= 10000000 && buyRatio >= 0.9) severity = 'critical';
          else if (totalVolume >= 5000000 && buyRatio >= 0.85) severity = 'high';
          
          patterns.push({
            id: `accumulation-${coin}-${windowStart}`,
            type: 'accumulation',
            timestamp: windowStart,
            coin,
            orders: windowOrders,
            totalVolume,
            avgSize,
            description: `Strong accumulation: ${buys.length}/${windowOrders.length} buys in 15min`,
            severity,
          });
          
          i += windowOrders.length - 1;
        }
      }
    }
  });
  
  return patterns;
}

/**
 * Detect distribution pattern (consistent selling over time)
 */
export function detectDistribution(orders: LargeOrder[]): WhalePattern[] {
  const patterns: WhalePattern[] = [];
  const timeWindow = 15 * 60 * 1000; // 15 minutes
  const minOrders = 5;
  const minSellRatio = 0.75; // 75% sells
  
  // Group by coin
  const coinGroups = new Map<string, LargeOrder[]>();
  
  orders.forEach(order => {
    if (!coinGroups.has(order.coin)) {
      coinGroups.set(order.coin, []);
    }
    coinGroups.get(order.coin)!.push(order);
  });
  
  coinGroups.forEach((coinOrders, coin) => {
    const sorted = [...coinOrders].sort((a, b) => b.timestamp - a.timestamp);
    
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].timestamp;
      const windowEnd = windowStart - timeWindow;
      
      const windowOrders = sorted.filter(
        o => o.timestamp >= windowEnd && o.timestamp <= windowStart
      );
      
      if (windowOrders.length >= minOrders) {
        const sells = windowOrders.filter(o => o.side === 'SELL');
        const sellRatio = sells.length / windowOrders.length;
        
        if (sellRatio >= minSellRatio) {
          const totalVolume = windowOrders.reduce((sum, o) => sum + o.usdValue, 0);
          const avgSize = totalVolume / windowOrders.length;
          
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
          if (totalVolume >= 10000000 && sellRatio >= 0.9) severity = 'critical';
          else if (totalVolume >= 5000000 && sellRatio >= 0.85) severity = 'high';
          
          patterns.push({
            id: `distribution-${coin}-${windowStart}`,
            type: 'distribution',
            timestamp: windowStart,
            coin,
            orders: windowOrders,
            totalVolume,
            avgSize,
            description: `Heavy distribution: ${sells.length}/${windowOrders.length} sells in 15min`,
            severity,
          });
          
          i += windowOrders.length - 1;
        }
      }
    }
  });
  
  return patterns;
}

/**
 * Detect sudden spike in whale activity
 */
export function detectActivitySpike(orders: LargeOrder[]): WhalePattern[] {
  const patterns: WhalePattern[] = [];
  const shortWindow = 2 * 60 * 1000; // 2 minutes
  const minOrders = 4;
  const minTotalVolume = 3000000; // $3M
  
  // Group by coin
  const coinGroups = new Map<string, LargeOrder[]>();
  
  orders.forEach(order => {
    if (!coinGroups.has(order.coin)) {
      coinGroups.set(order.coin, []);
    }
    coinGroups.get(order.coin)!.push(order);
  });
  
  coinGroups.forEach((coinOrders, coin) => {
    const sorted = [...coinOrders].sort((a, b) => b.timestamp - a.timestamp);
    
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].timestamp;
      const windowEnd = windowStart - shortWindow;
      
      const windowOrders = sorted.filter(
        o => o.timestamp >= windowEnd && o.timestamp <= windowStart
      );
      
      if (windowOrders.length >= minOrders) {
        const totalVolume = windowOrders.reduce((sum, o) => sum + o.usdValue, 0);
        
        if (totalVolume >= minTotalVolume) {
          const avgSize = totalVolume / windowOrders.length;
          
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'high';
          if (totalVolume >= 10000000) severity = 'critical';
          
          patterns.push({
            id: `spike-${coin}-${windowStart}`,
            type: 'spike',
            timestamp: windowStart,
            coin,
            orders: windowOrders,
            totalVolume,
            avgSize,
            description: `Sudden spike: ${windowOrders.length} orders in 2min`,
            severity,
          });
          
          i += windowOrders.length - 1;
        }
      }
    }
  });
  
  return patterns;
}

/**
 * Detect all whale patterns
 */
export function detectAllWhalePatterns(orders: LargeOrder[]): WhalePattern[] {
  const whaleOrders = orders.filter(o => o.isWhale);
  
  if (whaleOrders.length === 0) {
    return [];
  }
  
  const allPatterns = [
    ...detectMultipleLargeOrders(whaleOrders),
    ...detectAccumulation(whaleOrders),
    ...detectDistribution(whaleOrders),
    ...detectActivitySpike(whaleOrders),
  ];
  
  // Remove duplicates and sort by timestamp
  const uniquePatterns = Array.from(
    new Map(allPatterns.map(p => [p.id, p])).values()
  );
  
  return uniquePatterns.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity: WhalePattern['severity']): string {
  switch (severity) {
    case 'critical':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'high':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'low':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  }
}

/**
 * Get pattern icon
 */
export function getPatternIcon(type: WhalePattern['type']): string {
  switch (type) {
    case 'accumulation':
      return '📈';
    case 'distribution':
      return '📉';
    case 'spike':
      return '⚡';
    case 'multiple_large':
      return '🎯';
  }
}
