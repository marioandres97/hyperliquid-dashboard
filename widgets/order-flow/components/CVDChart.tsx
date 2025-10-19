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

  // Determine if mobile for responsive tick sizes
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  return (
    <div className="h-48 sm:h-56 md:h-64 lg:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={isMobile ? 0.3 : 0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: isMobile ? 10 : 12 }}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
            height={isMobile ? 60 : 30}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: isMobile ? 10 : 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
              fontSize: isMobile ? '11px' : '12px'
            }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="cvd" 
            stroke="#10B981" 
            strokeWidth={isMobile ? 1.5 : 2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}