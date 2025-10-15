'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TimeframeDelta } from '../types';

interface CVDChartProps {
  data: TimeframeDelta[];
}

export default function CVDChart({ data }: CVDChartProps) {
  // Calculate cumulative delta for chart
  const chartData = data.reduce((acc, curr, index) => {
    const prevCVD = index > 0 ? acc[index - 1].cvd : 0;
    acc.push({
      time: new Date(curr.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      cvd: prevCVD + curr.delta,
      delta: curr.delta,
    });
    return acc;
  }, [] as { time: string; cvd: number; delta: number }[]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="cvd" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}