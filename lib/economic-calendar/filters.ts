/**
 * Utility functions for filtering economic events
 */

import type { EconomicEvent, EventImpact } from './types';
import type { EventFilters } from '@/types/economic-calendar';

/**
 * Filter events by impact and countries
 */
export function applyFilters(
  events: EconomicEvent[],
  filters: EventFilters
): EconomicEvent[] {
  let filtered = [...events];

  // Filter by impact
  if (filters.impacts.length > 0) {
    filtered = filtered.filter((event) => 
      filters.impacts.includes(event.impact)
    );
  }

  // Filter by countries
  if (filters.countries.length > 0) {
    filtered = filtered.filter((event) => 
      filters.countries.includes(event.country)
    );
  }

  return filtered;
}

/**
 * Available countries with flags
 */
export const COUNTRIES = [
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'EU', name: 'EUR (Eurozone)', flag: '🇪🇺' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
] as const;

/**
 * Get country name and flag by code
 */
export function getCountryInfo(code: string) {
  return COUNTRIES.find((c) => c.code === code) || { code, name: code, flag: '🌍' };
}
