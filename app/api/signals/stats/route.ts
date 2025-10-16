import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { TrackedSignal, SignalStats } from '@/widgets/order-flow-signals/types';

export async function GET() {
  try {
    const signalIds = (await redis.smembers('signals:active')) || [];
    
    const signals: TrackedSignal[] = [];
    for (const id of signalIds) {
      const signalData = await redis.get(`signal:${id}`);
      if (signalData) {
        signals.push(JSON.parse(signalData as string));
      }
    }
    
    const stats = calculateStats(signals);
    
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}

function calculateStats(signals: TrackedSignal[]): SignalStats {
  const byStatus = {
    hit_target: 0,
    hit_stop: 0,
    expired: 0,
    dismissed: 0
  };
  
  const byCoin: Record<string, { total: number; wins: number; winRate: number }> = {};
  
  signals.forEach(s => {
    byStatus[s.status as keyof typeof byStatus]++;
    
    if (!byCoin[s.coin]) {
      byCoin[s.coin] = { total: 0, wins: 0, winRate: 0 };
    }
    byCoin[s.coin].total++;
    if (s.status === 'hit_target') byCoin[s.coin].wins++;
  });
  
  Object.keys(byCoin).forEach(coin => {
    byCoin[coin].winRate = (byCoin[coin].wins / byCoin[coin].total) * 100;
  });
  
  const totalTraded = byStatus.hit_target + byStatus.hit_stop;
  const winRate = totalTraded > 0 ? (byStatus.hit_target / totalTraded) * 100 : 0;
  
  return {
    totalSignals: signals.length,
    winRate,
    avgPnL: 0,
    byStatus,
    byCoin
  };
}