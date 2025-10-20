'use client';

interface StatusBadgeProps {
  status: 'open' | 'closed';
  pnl?: number | null;
}

export function StatusBadge({ status, pnl }: StatusBadgeProps) {
  if (status === 'open') {
    return (
      <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400 text-xs font-semibold">
        OPEN
      </span>
    );
  }

  const isProfit = (pnl ?? 0) >= 0;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      isProfit
        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
        : 'bg-red-500/20 border border-red-500/40 text-red-400'
    }`}>
      CLOSED
    </span>
  );
}
