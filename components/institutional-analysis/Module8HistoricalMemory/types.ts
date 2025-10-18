export interface TraderBehaviorEvent {
  id: string;
  traderId: string;
  timestamp: Date;
  action: 'OPENED' | 'CLOSED' | 'INCREASED' | 'DECREASED';
  positionType: 'LONG' | 'SHORT';
  size: number;
  price: number;
  outcome?: 'PROFIT' | 'LOSS' | 'PENDING';
  pnl?: number;
}

export interface RecurringPattern {
  id: string;
  pattern: string;
  frequency: number;
  lastOccurrence: Date;
  avgOutcome: number;
  confidence: number;
}

export interface SimilarScenario {
  id: string;
  timestamp: Date;
  similarity: number;
  marketConditions: {
    price: number;
    funding: number;
    volume: number;
  };
  outcome: string;
  timeframe: string;
}

export interface PredictiveInsight {
  id: string;
  prediction: string;
  probability: number;
  timeframe: string;
  basedOn: string[];
  confidence: number;
}
