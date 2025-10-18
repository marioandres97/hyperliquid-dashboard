/**
 * Format a price value based on asset type
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format a large number with K, M, B suffixes
 */
export function formatCompactNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 2, includeSign: boolean = true): string {
  const formatted = value.toFixed(decimals);
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format a volume value with asset
 */
export function formatVolume(volume: number, asset: string, decimals: number = 4): string {
  return `${volume.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${asset}`;
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

/**
 * Format a date in a standard way
 */
export function formatDate(timestamp: number | Date, includeTime: boolean = true): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (!includeTime) {
    return dateStr;
  }

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${dateStr} ${timeStr}`;
}

/**
 * Format a time in HH:MM:SS format
 */
export function formatTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Format a duration in ms to human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format leverage (e.g., "10x")
 */
export function formatLeverage(leverage: number): string {
  return `${leverage.toFixed(1)}x`;
}

/**
 * Format a wallet address (truncated)
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a transaction hash (truncated)
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 8, 6);
}

/**
 * Format a side (BUY/SELL) with color indicator
 */
export function formatSide(side: 'BUY' | 'SELL' | 'LONG' | 'SHORT'): string {
  return side;
}

/**
 * Get color class for a side
 */
export function getSideColor(side: 'BUY' | 'SELL' | 'LONG' | 'SHORT'): string {
  switch (side) {
    case 'BUY':
    case 'LONG':
      return 'text-green-400';
    case 'SELL':
    case 'SHORT':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get color class for a percentage change
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format a timestamp to ISO string
 */
export function formatISO(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toISOString();
}

/**
 * Parse and format a price string
 */
export function parsePriceString(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.-]/g, ''));
}

/**
 * Format notional value (price * size)
 */
export function formatNotional(price: number, size: number): string {
  return formatPrice(price * size);
}

/**
 * Format a spread value
 */
export function formatSpread(spread: number, isPercent: boolean = false): string {
  if (isPercent) {
    return formatPercent(spread, 3, false);
  }
  return formatPrice(spread, 4);
}
