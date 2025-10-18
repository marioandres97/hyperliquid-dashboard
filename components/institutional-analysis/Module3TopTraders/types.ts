export interface TraderPosition {
  rank: number;
  traderId: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  positionSize: number;
  averageEntry: number;
  currentPrice: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  lastChange: Date;
  changeType?: 'opened' | 'increased' | 'decreased' | 'closed';
}
