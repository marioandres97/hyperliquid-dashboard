export interface Market {
  name: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  region: string;
}

export interface MarketStatus {
  isOpen: boolean;
  status: 'OPEN' | 'CLOSED';
  reason?: string;
  minutesToNext: number;
  progress: number;
}

/**
 * Calculate the status of a market at a given time
 * @param market - Market configuration with open/close times
 * @param now - Current date/time
 * @returns Market status including open/closed state, countdown, and progress
 */
export function getMarketStatus(market: Market, now: Date): MarketStatus {
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const currentMinutes = utcHour * 60 + utcMinute;
  
  const dayOfWeek = now.getUTCDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekend) {
    return { isOpen: false, status: 'CLOSED', reason: 'Weekend', minutesToNext: 0, progress: 0 };
  }

  let openMinutes = market.openHour * 60 + market.openMinute;
  let closeMinutes = market.closeHour * 60 + market.closeMinute;
  
  // Handle markets that cross midnight (like CME)
  if (closeMinutes < openMinutes) {
    if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
      const totalDuration = (24 * 60 - openMinutes) + closeMinutes;
      const elapsed = currentMinutes >= openMinutes 
        ? currentMinutes - openMinutes 
        : (24 * 60 - openMinutes) + currentMinutes;
      const progress = (elapsed / totalDuration) * 100;
      const minutesToClose = currentMinutes >= openMinutes
        ? (24 * 60 - currentMinutes) + closeMinutes
        : closeMinutes - currentMinutes;
      return { isOpen: true, status: 'OPEN', minutesToNext: minutesToClose, progress };
    } else {
      const minutesToOpen = openMinutes - currentMinutes;
      return { isOpen: false, status: 'CLOSED', minutesToNext: minutesToOpen, progress: 0 };
    }
  }
  
  // Normal case
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const totalDuration = closeMinutes - openMinutes;
    const elapsed = currentMinutes - openMinutes;
    const progress = (elapsed / totalDuration) * 100;
    const minutesToClose = closeMinutes - currentMinutes;
    return { isOpen: true, status: 'OPEN', minutesToNext: minutesToClose, progress };
  } else if (currentMinutes < openMinutes) {
    const minutesToOpen = openMinutes - currentMinutes;
    return { isOpen: false, status: 'CLOSED', minutesToNext: minutesToOpen, progress: 0 };
  } else {
    const minutesToOpen = (24 * 60 - currentMinutes) + openMinutes;
    return { isOpen: false, status: 'CLOSED', minutesToNext: minutesToOpen, progress: 0 };
  }
}

/**
 * Format time from minutes since midnight to HH:MM
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Format countdown from total minutes to human-readable string
 */
export function formatCountdown(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
