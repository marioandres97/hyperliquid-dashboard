'use client';

import { EquityPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface EquityCurveChartProps {
  equityCurve: EquityPoint[];
  initialCapital: number;
}

export function EquityCurveChart({ equityCurve, initialCapital }: EquityCurveChartProps) {
  if (equityCurve.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">No equity data available</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = equityCurve.map(point => ({
    time: new Date(point.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    }),
    equity: point.equity,
    drawdown: ((point.equity - initialCapital) / initialCapital) * 100
  }));

  const finalEquity = equityCurve[equityCurve.length - 1].equity;
  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;
  const isProfit = totalReturn >= 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/70">Equity Curve</h3>
        <div className="flex items-center gap-4">
          <div className="text-xs text-white/50">
            Start: ${initialCapital.toFixed(2)}
          </div>
          <div className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            Final: ${finalEquity.toFixed(2)} ({isProfit ? '+' : ''}{totalReturn.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="time" 
            stroke="#ffffff40"
            tick={{ fill: '#ffffff60', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#ffffff40"
            tick={{ fill: '#ffffff60', fontSize: 12 }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a',
              border: '1px solid #ffffff20',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'equity') {
                return [`$${value.toFixed(2)}`, 'Equity'];
              }
              return [`${value.toFixed(2)}%`, 'Return'];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="equity" 
            stroke={isProfit ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            dot={false}
            name="Equity"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
