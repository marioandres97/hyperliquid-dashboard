export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBookData {
  coin: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  midPrice: number;
  totalBidVolume: number;
  totalAskVolume: number;
  imbalance: {
    bidPercent: number;
    askPercent: number;
    ratio: number;
  };
  timestamp: number;
}

/**
 * Parse raw order book snapshot from WebSocket
 */
export function parseOrderBook(snapshot: any, coin: string): OrderBookData {
  const [rawBids, rawAsks] = snapshot.levels || [[], []];

  // Parse and sort levels
  const bids: OrderBookLevel[] = rawBids
    .map((level: any) => ({
      price: parseFloat(level.px),
      size: parseFloat(level.sz),
      total: parseFloat(level.px) * parseFloat(level.sz),
    }))
    .slice(0, 10)
    .sort((a: OrderBookLevel, b: OrderBookLevel) => b.price - a.price);

  const asks: OrderBookLevel[] = rawAsks
    .map((level: any) => ({
      price: parseFloat(level.px),
      size: parseFloat(level.sz),
      total: parseFloat(level.px) * parseFloat(level.sz),
    }))
    .slice(0, 10)
    .sort((a: OrderBookLevel, b: OrderBookLevel) => a.price - b.price);

  // Calculate metrics
  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;
  const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;

  // Calculate total volumes
  const totalBidVolume = bids.reduce((sum, level) => sum + level.size, 0);
  const totalAskVolume = asks.reduce((sum, level) => sum + level.size, 0);

  // Calculate imbalance
  const totalVolume = totalBidVolume + totalAskVolume;
  const bidPercent = totalVolume > 0 ? (totalBidVolume / totalVolume) * 100 : 50;
  const askPercent = totalVolume > 0 ? (totalAskVolume / totalVolume) * 100 : 50;
  const ratio = totalAskVolume > 0 ? totalBidVolume / totalAskVolume : 1;

  return {
    coin,
    bids,
    asks,
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
    midPrice,
    totalBidVolume,
    totalAskVolume,
    imbalance: {
      bidPercent,
      askPercent,
      ratio,
    },
    timestamp: snapshot.timestamp || Date.now(),
  };
}

/**
 * Get bar width percentage based on max volume
 */
export function getBarWidth(size: number, maxSize: number): number {
  if (maxSize === 0) return 0;
  return Math.min((size / maxSize) * 100, 100);
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format size for display
 */
export function formatSize(size: number, decimals: number = 4): string {
  if (size >= 1000) {
    return (size / 1000).toFixed(1) + 'K';
  }
  return size.toFixed(decimals);
}
