export interface HourlyVolumeData {
  hour: number;
  volume: number;
  trades: number;
  avgPrice: number;
}

export interface MacroEvent {
  id: string;
  timestamp: Date;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'ECONOMIC' | 'TECHNICAL' | 'REGULATORY' | 'MARKET';
}

export interface TraderTimingPattern {
  traderId: string;
  preferredHours: number[];
  avgPositionSize: number;
  successRate: number;
  totalTrades: number;
}

export interface BehavioralInsight {
  id: string;
  insight: string;
  confidence: number;
  relatedData: any;
}
