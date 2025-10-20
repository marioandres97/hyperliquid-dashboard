'use client';

import { BigMetricCard } from './BigMetricCard';
import { MetricCard } from './MetricCard';
import { DollarSign, Target, TrendingUp, TrendingDown, Users, CreditCard } from 'lucide-react';
import { PnLMetrics } from '@/types/pnl-tracker';
import { formatCurrency } from '@/lib/pnl-tracker/calculations';

interface MetricsGridProps {
  metrics: PnLMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Big Card - Total PnL */}
      <BigMetricCard
        totalPnL={metrics.totalPnL}
        totalPnLPercent={metrics.totalPnLPercent}
        totalTrades={metrics.totalTrades}
      />

      {/* Regular Cards */}
      <MetricCard
        title="Open Positions"
        value={metrics.openPositions}
        icon={Users}
        variant="neutral"
      />

      <MetricCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
        icon={Target}
        variant="neutral"
      />

      <MetricCard
        title="Best Trade"
        value={formatCurrency(metrics.bestTrade, true)}
        icon={TrendingUp}
        variant="profit"
      />

      <MetricCard
        title="Worst Trade"
        value={formatCurrency(metrics.worstTrade, true)}
        icon={TrendingDown}
        variant="loss"
      />

      <MetricCard
        title="Avg Trade Size"
        value={formatCurrency(metrics.avgTradeSize)}
        icon={DollarSign}
        variant="neutral"
      />

      <MetricCard
        title="Total Fees Paid"
        value={formatCurrency(metrics.totalFeesPaid)}
        icon={CreditCard}
        variant="neutral"
      />
    </div>
  );
}
