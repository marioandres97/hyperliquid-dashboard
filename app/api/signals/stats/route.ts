import { NextResponse } from 'next/server';
import { SignalStats } from '@/types/signal-stats';

export async function GET() {
  try {
    const stats: SignalStats = {
      totalSignals: 914,
      winRate: 28.6,
      avgPnL: 0,
      byStatus: {
        hit_target: 2,
        hit_stop: 5,
        expired: 0,
        dismissed: 0
      },
      byCoin: {
        BTC: { total: 791, wins: 2, winRate: 0.25 },
        ETH: { total: 122, wins: 0, winRate: 0 },
        HYPE: { total: 1, wins: 0, winRate: 0 }
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}