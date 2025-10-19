'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { OHLCCandle } from '@/lib/hyperliquid/types';

interface CandlestickChartProps {
  data: OHLCCandle[];
  height?: number;
}

export default function CandlestickChart({ data, height = 200 }: CandlestickChartProps) {
  // Format data for charting - use close prices for line chart
  const chartData = useMemo(() => {
    return data.map(candle => ({
      ...candle,
      timeStr: new Date(candle.time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }),
    }));
  }, [data]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    }) + ' UTC';
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-xs text-white/40">No data available</div>
      </div>
    );
  }

  // Determine if overall trend is bullish or bearish
  const isOverallBullish = data.length > 0 && data[data.length - 1].close >= data[0].open;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isOverallBullish ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={isOverallBullish ? "#10B981" : "#EF4444"} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tickFormatter={formatTime}
          stroke="#ffffff40"
          tick={{ fill: '#ffffff60', fontSize: 10 }}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        <YAxis
          domain={['auto', 'auto']}
          stroke="#ffffff40"
          tick={{ fill: '#ffffff60', fontSize: 10 }}
          width={70}
          tickFormatter={(val) => `$${val.toFixed(0)}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload[0]) return null;
            
            const data = payload[0].payload;
            const isGreen = data.close >= data.open;
            
            // Format full date/time
            const date = new Date(data.time);
            const fullDateTime = date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC',
            }) + ' UTC';
            
            // Calculate volume in USD (volume * average price)
            const avgPrice = (data.high + data.low) / 2;
            const volumeUSD = data.volume * avgPrice;
            const volumeStr = volumeUSD >= 1e6 
              ? `$${(volumeUSD / 1e6).toFixed(2)}M` 
              : volumeUSD >= 1e3 
              ? `$${(volumeUSD / 1e3).toFixed(1)}K` 
              : `$${volumeUSD.toFixed(0)}`;
            
            return (
              <div className="bg-black/95 border border-white/30 rounded-lg p-3 text-xs shadow-xl">
                <div className="text-white/70 mb-2 font-medium">{fullDateTime}</div>
                <div className="space-y-1">
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">Open:</span>
                    <span className="text-white font-medium">{formatPrice(data.open)}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">High:</span>
                    <span className="text-green-400 font-medium">{formatPrice(data.high)}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">Low:</span>
                    <span className="text-red-400 font-medium">{formatPrice(data.low)}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className="text-white/50">Close:</span>
                    <span className={`font-medium ${isGreen ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPrice(data.close)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-6 pt-1 border-t border-white/10">
                    <span className="text-white/50">Volume:</span>
                    <span className="text-white/80 font-medium">
                      {data.volume.toFixed(2)} ({volumeStr})
                    </span>
                  </div>
                </div>
              </div>
            );
          }}
        />
        
        {/* Price area with gradient */}
        <Area
          type="monotone"
          dataKey="close"
          stroke={isOverallBullish ? "#10B981" : "#EF4444"}
          strokeWidth={2}
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
