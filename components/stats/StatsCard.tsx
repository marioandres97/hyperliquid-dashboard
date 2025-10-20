interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  large?: boolean;
}

export default function StatsCard({ title, value, subtitle, trend, large }: StatsCardProps) {
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  
  return (
    <div className={`backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6 ${large ? 'md:col-span-2' : ''}`}>
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <p className={`text-3xl font-semibold ${trend ? trendColor : 'text-white'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
