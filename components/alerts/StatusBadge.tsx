'use client';

interface StatusBadgeProps {
  status: 'active' | 'triggered' | 'inactive';
  size?: 'sm' | 'md';
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    icon: '●',
  },
  triggered: {
    label: 'Triggered',
    className: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    icon: '🔔',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-500/20 border-gray-500/40 text-gray-400',
    icon: '○',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.className} ${sizeClasses}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
