import type { EconomicEvent, EventCategory, EventImpact } from './types';

/**
 * Top 15 high-impact economic events to track
 * Data structure includes typical impact patterns for crypto markets
 */
export const TOP_ECONOMIC_EVENTS: Partial<EconomicEvent>[] = [
  {
    name: 'Fed Meeting Minutes (FOMC)',
    country: 'US',
    category: 'central_bank' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Monthly (8 times/year)',
    source: 'Federal Reserve',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    btcAvgImpact: 3.5,
    ethAvgImpact: 4.2,
    spxAvgImpact: 1.8,
    volumeSpike: 250,
    primaryWindowStart: '14:00',
    primaryWindowEnd: '16:00',
    extendedWindowStart: '14:00',
    extendedWindowEnd: '18:00',
  },
  {
    name: 'US CPI Data',
    country: 'US',
    category: 'inflation' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Monthly',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov/cpi/',
    btcAvgImpact: 4.2,
    ethAvgImpact: 5.1,
    spxAvgImpact: 2.2,
    volumeSpike: 300,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '17:00',
  },
  {
    name: 'Non-Farm Payrolls (NFP)',
    country: 'US',
    category: 'employment' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Monthly',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov/ces/',
    btcAvgImpact: 3.8,
    ethAvgImpact: 4.5,
    spxAvgImpact: 2.0,
    volumeSpike: 280,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '17:00',
  },
  {
    name: 'FOMC Rate Decision',
    country: 'US',
    category: 'central_bank' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: '8 times/year',
    source: 'Federal Reserve',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    btcAvgImpact: 5.2,
    ethAvgImpact: 6.0,
    spxAvgImpact: 2.5,
    volumeSpike: 350,
    primaryWindowStart: '14:00',
    primaryWindowEnd: '16:00',
    extendedWindowStart: '14:00',
    extendedWindowEnd: '18:00',
  },
  {
    name: 'US GDP (Preliminary/Final)',
    country: 'US',
    category: 'gdp_growth' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Quarterly',
    source: 'Bureau of Economic Analysis',
    sourceUrl: 'https://www.bea.gov/data/gdp',
    btcAvgImpact: 2.8,
    ethAvgImpact: 3.2,
    spxAvgImpact: 1.5,
    volumeSpike: 220,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'ECB Rate Decision',
    country: 'EU',
    category: 'central_bank' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: '8 times/year',
    source: 'European Central Bank',
    sourceUrl: 'https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html',
    btcAvgImpact: 3.2,
    ethAvgImpact: 3.8,
    spxAvgImpact: 1.2,
    volumeSpike: 240,
    primaryWindowStart: '12:45',
    primaryWindowEnd: '14:45',
    extendedWindowStart: '12:45',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'US PPI Data',
    country: 'US',
    category: 'inflation' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Monthly',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov/ppi/',
    btcAvgImpact: 2.5,
    ethAvgImpact: 3.0,
    spxAvgImpact: 1.3,
    volumeSpike: 200,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'Unemployment Rate',
    country: 'US',
    category: 'employment' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Monthly',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov/cps/',
    btcAvgImpact: 2.2,
    ethAvgImpact: 2.8,
    spxAvgImpact: 1.0,
    volumeSpike: 180,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'Retail Sales',
    country: 'US',
    category: 'retail_consumer' as EventCategory,
    impact: 'MEDIUM' as EventImpact,
    frequency: 'Monthly',
    source: 'US Census Bureau',
    sourceUrl: 'https://www.census.gov/retail/index.html',
    btcAvgImpact: 2.0,
    ethAvgImpact: 2.5,
    spxAvgImpact: 0.9,
    volumeSpike: 150,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'PMI Manufacturing (US)',
    country: 'US',
    category: 'manufacturing' as EventCategory,
    impact: 'MEDIUM' as EventImpact,
    frequency: 'Monthly',
    source: 'Institute for Supply Management',
    sourceUrl: 'https://www.ismworld.org/',
    btcAvgImpact: 1.8,
    ethAvgImpact: 2.2,
    spxAvgImpact: 0.8,
    volumeSpike: 140,
    primaryWindowStart: '14:00',
    primaryWindowEnd: '16:00',
    extendedWindowStart: '14:00',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'Fed Chair Speech',
    country: 'US',
    category: 'central_bank' as EventCategory,
    impact: 'HIGH' as EventImpact,
    frequency: 'Multiple times/year',
    source: 'Federal Reserve',
    sourceUrl: 'https://www.federalreserve.gov/newsevents/speeches.htm',
    btcAvgImpact: 3.0,
    ethAvgImpact: 3.5,
    spxAvgImpact: 1.5,
    volumeSpike: 220,
    primaryWindowStart: '00:00',
    primaryWindowEnd: '23:59',
    extendedWindowStart: '00:00',
    extendedWindowEnd: '23:59',
  },
  {
    name: 'ECB Meeting Minutes',
    country: 'EU',
    category: 'central_bank' as EventCategory,
    impact: 'MEDIUM' as EventImpact,
    frequency: '8 times/year',
    source: 'European Central Bank',
    sourceUrl: 'https://www.ecb.europa.eu/press/accounts/html/index.en.html',
    btcAvgImpact: 1.5,
    ethAvgImpact: 1.8,
    spxAvgImpact: 0.6,
    volumeSpike: 120,
    primaryWindowStart: '12:30',
    primaryWindowEnd: '14:30',
    extendedWindowStart: '12:30',
    extendedWindowEnd: '15:00',
  },
  {
    name: 'Consumer Confidence',
    country: 'US',
    category: 'retail_consumer' as EventCategory,
    impact: 'MEDIUM' as EventImpact,
    frequency: 'Monthly',
    source: 'Conference Board',
    sourceUrl: 'https://www.conference-board.org/topics/consumer-confidence',
    btcAvgImpact: 1.2,
    ethAvgImpact: 1.5,
    spxAvgImpact: 0.5,
    volumeSpike: 110,
    primaryWindowStart: '14:00',
    primaryWindowEnd: '16:00',
    extendedWindowStart: '14:00',
    extendedWindowEnd: '16:00',
  },
  {
    name: 'Housing Starts',
    country: 'US',
    category: 'gdp_growth' as EventCategory,
    impact: 'MEDIUM' as EventImpact,
    frequency: 'Monthly',
    source: 'US Census Bureau',
    sourceUrl: 'https://www.census.gov/construction/nrc/index.html',
    btcAvgImpact: 1.0,
    ethAvgImpact: 1.2,
    spxAvgImpact: 0.4,
    volumeSpike: 100,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '15:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '15:30',
  },
  {
    name: 'Initial Jobless Claims',
    country: 'US',
    category: 'employment' as EventCategory,
    impact: 'MEDIUM' as EventImpact,
    frequency: 'Weekly',
    source: 'Department of Labor',
    sourceUrl: 'https://www.dol.gov/ui/data.pdf',
    btcAvgImpact: 0.8,
    ethAvgImpact: 1.0,
    spxAvgImpact: 0.3,
    volumeSpike: 90,
    primaryWindowStart: '13:30',
    primaryWindowEnd: '14:30',
    extendedWindowStart: '13:30',
    extendedWindowEnd: '15:00',
  },
];

/**
 * Get icon for event category
 */
export function getCategoryIcon(category: EventCategory): string {
  const icons: Record<EventCategory, string> = {
    central_bank: '🏦',
    inflation: '📊',
    employment: '👔',
    manufacturing: '🏭',
    gdp_growth: '📈',
    retail_consumer: '💰',
  };
  return icons[category] || '📅';
}

/**
 * Get color class for impact level
 */
export function getImpactColor(impact: EventImpact): string {
  switch (impact) {
    case 'HIGH':
      return 'text-red-500';
    case 'MEDIUM':
      return 'text-yellow-500';
    case 'LOW':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get badge emoji for impact level
 */
export function getImpactBadge(impact: EventImpact): string {
  switch (impact) {
    case 'HIGH':
      return '🔴';
    case 'MEDIUM':
      return '🟡';
    case 'LOW':
      return '⚪';
    default:
      return '⚪';
  }
}
