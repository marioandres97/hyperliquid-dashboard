/**
 * CVD (Cumulative Volume Delta) Utilities
 * 
 * CVD tracks the running total of buy volume minus sell volume,
 * showing institutional buying/selling pressure over time.
 */

export interface Trade {
  timestamp: number;
  side: 'BUY' | 'SELL';
  size: number;
  price: number;
}

export interface CVDDataPoint {
  time: number;
  cvd: number;
}

/**
 * Calculate CVD from trades for a given time period
 * @param trades - Array of trades
 * @param hours - Number of hours to look back (default 24)
 * @returns Array of CVD data points with timestamps
 */
export function calculateCVD(trades: Trade[], hours: number = 24): CVDDataPoint[] {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  const filtered = trades.filter(t => t.timestamp >= cutoff);
  
  // Sort by timestamp ascending
  const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);
  
  let cvd = 0;
  return sorted.map(trade => {
    cvd += trade.side === 'BUY' 
      ? trade.size * trade.price 
      : -(trade.size * trade.price);
    return { time: trade.timestamp, cvd };
  });
}

/**
 * Determine CVD trend (positive = bullish, negative = bearish)
 * @param cvdData - Array of CVD data points
 * @returns Positive number if trending up, negative if trending down
 */
export function getCVDTrend(cvdData: CVDDataPoint[]): number {
  if (cvdData.length < 2) return 0;
  
  const start = cvdData[0].cvd;
  const end = cvdData[cvdData.length - 1].cvd;
  
  return end - start;
}

/**
 * Format timestamp for chart display
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export function formatCVDTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}
