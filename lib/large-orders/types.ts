export type CoinFilter = 'BTC' | 'ETH' | 'HYPE' | 'ALL';
export type SizeFilter = 100000 | 250000 | 500000 | 1000000;
export type SideFilter = 'BUY' | 'SELL' | 'BOTH';

export interface LargeOrder {
  id: string;
  timestamp: number;
  coin: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  usdValue: number;
  exchange: string;
  isWhale?: boolean;
  marketPrice?: number;
  priceImpact?: number;
}

export interface LargeOrderFilters {
  coin?: CoinFilter;
  minSize?: SizeFilter;
  side?: SideFilter;
}

/**
 * Check if trade qualifies as a large order
 */
export function isLargeOrder(usdValue: number, minSize: SizeFilter = 100000): boolean {
  return usdValue >= minSize;
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format price impact percentage
 */
export function formatPriceImpact(impact?: number): string {
  if (impact === undefined) return '';
  const sign = impact >= 0 ? '+' : '';
  return `${sign}${impact.toFixed(2)}%`;
}

/**
 * Get price impact color class
 */
export function getPriceImpactColor(impact?: number): string {
  if (impact === undefined) return 'text-gray-400';
  if (Math.abs(impact) < 0.1) return 'text-gray-400';
  return impact > 0 ? 'text-emerald-400' : 'text-red-400';
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

/**
 * Convert trade data to large order
 */
export function tradeToLargeOrder(trade: any, coin: string, marketPrice?: number): LargeOrder {
  const price = parseFloat(trade.px);
  const size = parseFloat(trade.sz);
  const usdValue = price * size;
  
  // Calculate price impact if market price is available
  let priceImpact: number | undefined;
  if (marketPrice && marketPrice > 0) {
    priceImpact = ((price - marketPrice) / marketPrice) * 100;
  }
  
  return {
    id: `${trade.tid || Date.now()}-${coin}`,
    timestamp: trade.time || Date.now(),
    coin,
    side: trade.side === 'A' ? 'BUY' : 'SELL',
    price,
    size,
    usdValue,
    exchange: 'Hyperliquid',
    marketPrice,
    priceImpact,
  };
}

/**
 * Filter large orders based on criteria
 */
export function filterLargeOrders(
  orders: LargeOrder[],
  filters: LargeOrderFilters
): LargeOrder[] {
  return orders.filter((order) => {
    // Filter by coin
    if (filters.coin && filters.coin !== 'ALL' && order.coin !== filters.coin) {
      return false;
    }

    // Filter by size
    if (filters.minSize && order.usdValue < filters.minSize) {
      return false;
    }

    // Filter by side
    if (filters.side && filters.side !== 'BOTH' && order.side !== filters.side) {
      return false;
    }

    return true;
  });
}

/**
 * Export orders to CSV
 */
export function exportToCSV(orders: LargeOrder[]): string {
  const headers = ['Timestamp', 'Coin', 'Side', 'Price', 'Size', 'USD Value', 'Exchange'];
  const rows = orders.map((order) => [
    new Date(order.timestamp).toISOString(),
    order.coin,
    order.side,
    order.price.toString(),
    order.size.toString(),
    order.usdValue.toString(),
    order.exchange,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(orders: LargeOrder[], filename: string = 'large-orders.csv') {
  const csv = exportToCSV(orders);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
