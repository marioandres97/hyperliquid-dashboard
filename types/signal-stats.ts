export interface SignalStats {
  totalSignals: number;
  winRate: number;
  avgPnL: number;
  byStatus: {
    hit_target: number;
    hit_stop: number;
    expired: number;
    dismissed: number;
  };
  byCoin: {
    [key: string]: {
      total: number;
      wins: number;
      winRate: number;
    };
  };
}
