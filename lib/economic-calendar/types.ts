export type EventImpact = 'HIGH' | 'MEDIUM' | 'LOW';

export type EventCategory = 
  | 'central_bank'
  | 'inflation'
  | 'employment'
  | 'manufacturing'
  | 'gdp_growth'
  | 'retail_consumer';

export type EventSentiment = 'Hawkish' | 'Dovish' | 'Neutral';

export interface EconomicEvent {
  id: string;
  name: string;
  country: string;
  category: EventCategory;
  impact: EventImpact;
  eventDate: Date;
  source?: string;
  sourceUrl?: string;
  frequency?: string;
  
  // Historical impact data
  btcAvgImpact?: number;
  ethAvgImpact?: number;
  spxAvgImpact?: number;
  volumeSpike?: number;
  
  // Volatility windows
  primaryWindowStart?: string;
  primaryWindowEnd?: string;
  extendedWindowStart?: string;
  extendedWindowEnd?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRelease {
  id: string;
  eventId: string;
  releaseDate: Date;
  sentiment?: EventSentiment;
  btcImpact?: number;
  ethImpact?: number;
  spxImpact?: number;
  createdAt: Date;
}

export interface EconomicEventWithReleases extends EconomicEvent {
  releases: EventRelease[];
}

export interface CalendarFilters {
  timeRange?: 'today' | 'week' | 'month';
  impact?: EventImpact;
  category?: EventCategory;
}
