'use client';

import { motion } from 'framer-motion';
import type { AssetStats } from '@/types/large-orders';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AssetStatsGridProps {
  asset: string;
  stats: AssetStats;
}

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  index: number;
}

function StatCard({ label, value, change, index }: StatCardProps) {
  const hasChange = change !== undefined;
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-xl p-4 hover:bg-gray-900/40 hover:border-emerald-500/20 transition-all"
    >
      <p className="text-gray-400 text-xs font-medium mb-1.5">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-white font-mono">{value}</p>
        {hasChange && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${
            isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AssetStatsGrid({ asset, stats }: AssetStatsGridProps) {
  const getStatsForAsset = (): Array<{ label: string; value: string; change?: number }> => {
    switch (asset) {
      case 'BTC':
        return [
          { label: 'Market Cap', value: stats.marketCap || '$1.2T' },
          { label: 'Dominance', value: stats.dominance || '54.2%' },
          { label: 'Open Interest', value: stats.openInterest || '$45.2B' },
          { label: 'Volume 24h', value: stats.volume24h || '$28.5B', change: stats.priceChange24h },
        ];
      case 'ETH':
        return [
          { label: 'Market Cap', value: stats.marketCap || '$480B' },
          { label: 'Open Interest', value: stats.openInterest || '$18.5B' },
          { label: 'TVL', value: stats.tvl || '$95B' },
          { label: 'Gas Price', value: stats.gasPrice || '25 Gwei' },
        ];
      case 'HYPE':
        return [
          { label: 'Market Cap', value: stats.marketCap || '$2.5B' },
          { label: 'Open Interest', value: stats.openInterest || '$850M' },
          { label: 'TVL', value: stats.tvl || '$125M' },
          { label: 'Circulating Supply', value: stats.circulatingSupply || '250M' },
        ];
      default:
        return [
          { label: 'Total Volume', value: stats.volume24h || '$45.2M' },
          { label: 'Avg Order Size', value: '$125K' },
          { label: 'Buy/Sell Ratio', value: '1.8', change: 12.5 },
          { label: 'Whales Active', value: '23' },
        ];
    }
  };

  const statCards = getStatsForAsset();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          index={index}
        />
      ))}
    </div>
  );
}
