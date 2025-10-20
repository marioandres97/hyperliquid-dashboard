'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trade } from '@/types/pnl-tracker';
import { calculateCumulativePnL } from '@/lib/pnl-tracker/calculations';
import { format } from 'date-fns';

interface PnLChartProps {
  trades: Trade[];
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export function PnLChart({ trades }: PnLChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');

  const chartData = useMemo(() => {
    const cumulativeData = calculateCumulativePnL(trades);
    
    if (timeframe === 'ALL') {
      return cumulativeData;
    }

    const now = new Date();
    const cutoffDates: Record<Timeframe, Date> = {
      '1D': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '1W': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '1M': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3M': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6M': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      '1Y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      'ALL': new Date(0),
    };

    const cutoff = cutoffDates[timeframe];
    return cumulativeData.filter(d => new Date(d.date) >= cutoff);
  }, [trades, timeframe]);

  const formattedData = chartData.map(d => ({
    ...d,
    dateStr: format(new Date(d.date), 'MMM dd'),
  }));

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">P&L Chart</h3>
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {formattedData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No closed trades to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPnlNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="dateStr" 
              stroke="#ffffff40"
              tick={{ fill: '#ffffff60', fontSize: 12 }}
            />
            <YAxis 
              stroke="#ffffff40"
              tick={{ fill: '#ffffff60', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a',
                border: '1px solid #ffffff20',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number, name: string) => {
                if (name === 'pnl') return [`$${value.toFixed(2)}`, 'Cumulative PnL'];
                return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="pnl" 
              stroke="#10B981" 
              strokeWidth={2}
              fill="url(#colorPnl)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
