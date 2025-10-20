import type { LargeOrder, WhaleAlert } from '@/types/large-orders';

export const WHALE_THRESHOLD = 1000000; // $1M

/**
 * Check if an order qualifies as a whale order
 */
export function isWhaleOrder(usdValue: number): boolean {
  return usdValue >= WHALE_THRESHOLD;
}

/**
 * Detect whale orders from a list of orders
 */
export function detectWhaleOrders(orders: LargeOrder[]): LargeOrder[] {
  return orders.filter(order => isWhaleOrder(order.usdValue));
}

/**
 * Create whale alert notification
 */
export function createWhaleAlert(order: LargeOrder): WhaleAlert {
  return {
    order,
    timestamp: Date.now(),
    notified: false,
  };
}

/**
 * Get whale statistics from orders
 */
export function getWhaleStats(orders: LargeOrder[]) {
  const whaleOrders = detectWhaleOrders(orders);
  const totalWhaleVolume = whaleOrders.reduce((sum, order) => sum + order.usdValue, 0);
  const avgWhaleSize = whaleOrders.length > 0 ? totalWhaleVolume / whaleOrders.length : 0;
  
  const buyWhales = whaleOrders.filter(o => o.side === 'BUY');
  const sellWhales = whaleOrders.filter(o => o.side === 'SELL');
  
  return {
    count: whaleOrders.length,
    totalVolume: totalWhaleVolume,
    avgSize: avgWhaleSize,
    buyCount: buyWhales.length,
    sellCount: sellWhales.length,
    buyVolume: buyWhales.reduce((sum, o) => sum + o.usdValue, 0),
    sellVolume: sellWhales.reduce((sum, o) => sum + o.usdValue, 0),
  };
}

/**
 * Format whale alert message
 */
export function formatWhaleAlert(order: LargeOrder): string {
  const value = formatLargeValue(order.usdValue);
  return `🐋 Whale Alert: ${order.side} ${order.coin} - ${value}`;
}

/**
 * Format large USD values
 */
function formatLargeValue(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Play notification sound for whale alert (if enabled)
 */
export function playWhaleSound(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Failed to play whale alert sound:', error);
  }
}
