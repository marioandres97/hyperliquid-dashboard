import redis, { isRedisAvailable } from '@/lib/redis';
import { NextResponse } from 'next/server';
import { TrackedSignal, SignalStats } from '@/widgets/order-flow-signals/types';

export async function GET() {
  try {
    if (!isRedisAvailable() || !redis) {
      return NextResponse.json(getEmptyStats());
    }

    // Get signals from Redis
    const signalIds = (await redis.smembers('signals:active')) || [];
    
    // If no signals exist, return zeros
    if (signalIds.length === 0) {
      return NextResponse.json(getEmptyStats());
    }
    
    // Get all signals in parallel using pipeline
    const pipeline = redis.pipeline();
    signalIds.forEach(id => pipeline.get(`signal:${id}`));
    const results = await pipeline.exec();

    const signals: TrackedSignal[] = [];
    results?.forEach(([err, data]) => {
      if (!err && data) {
        signals.push(JSON.parse(data as string));
      }
    });
    
    const stats = calculateStats(signals);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(getEmptyStats());
  }
}

function getEmptyStats(): SignalStats {
  return {
    totalSignals: 0,
    winRate: 0,
    avgPnL: 0,
    byStatus: {
      hit_target: 0,
      hit_stop: 0,
      expired: 0,
      dismissed: 0
    },
    byCoin: {
      BTC: { total: 0, wins: 0, winRate: 0 },
      ETH: { total: 0, wins: 0, winRate: 0 },
      HYPE: { total: 0, wins: 0, winRate: 0 }
    }
  };
}

function calculateStats(signals: TrackedSignal[]): SignalStats {
  const byStatus = {
    hit_target: 0,
    hit_stop: 0,
    expired: 0,
    dismissed: 0
  };
  
  const byCoin: Record<string, { total: number; wins: number; winRate: number }> = {
    BTC: { total: 0, wins: 0, winRate: 0 },
    ETH: { total: 0, wins: 0, winRate: 0 },
    HYPE: { total: 0, wins: 0, winRate: 0 }
  };
  
  signals.forEach(s => {
    byStatus[s.status as keyof typeof byStatus]++;
    
    if (!byCoin[s.coin]) {
      byCoin[s.coin] = { total: 0, wins: 0, winRate: 0 };
    }
    byCoin[s.coin].total++;
    if (s.status === 'hit_target') byCoin[s.coin].wins++;
  });
  
  Object.keys(byCoin).forEach(coin => {
    byCoin[coin].winRate = byCoin[coin].total > 0 
      ? (byCoin[coin].wins / byCoin[coin].total) * 100 
      : 0;
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