// Shared chart configuration and defaults to reduce duplication
// and ensure consistent styling across all charts

export const CHART_COLORS = {
  primary: '#8B5CF6',
  secondary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  grid: '#374151',
  text: '#9CA3AF',
  tooltip: {
    background: '#1F2937',
    border: '#374151',
  },
};

export const CHART_DEFAULTS = {
  grid: {
    strokeDasharray: '3 3',
    stroke: CHART_COLORS.grid,
  },
  axis: {
    stroke: CHART_COLORS.text,
    tick: {
      fill: CHART_COLORS.text,
      fontSize: 12,
    },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: CHART_COLORS.tooltip.background,
      border: `1px solid ${CHART_COLORS.tooltip.border}`,
      borderRadius: '8px',
      color: '#fff',
    },
    cursor: {
      stroke: CHART_COLORS.grid,
      strokeDasharray: '3 3',
    },
  },
  line: {
    strokeWidth: 2,
    dot: false,
    activeDot: {
      r: 4,
    },
  },
  area: {
    strokeWidth: 2,
    fillOpacity: 0.3,
  },
};

export const formatChartPrice = (value: number): string => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(2)}`;
};

export const formatChartVolume = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

export const formatChartTime = (timestamp: number | string): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatChartDate = (timestamp: number | string): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
