'use client';

import { useState } from 'react';
import { AlertCard } from './AlertCard';
import { Filter } from 'lucide-react';
import type { Alert } from '@/types/alerts';

interface AlertsListProps {
  alerts: Alert[];
  onEdit?: (alert: Alert) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, active: boolean) => void;
}

type FilterStatus = 'all' | 'active' | 'triggered';

export function AlertsList({ alerts, onEdit, onDelete, onToggle }: AlertsListProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return alert.active && !alert.triggered;
    if (filter === 'triggered') return alert.triggered;
    return true;
  });

  const activeCount = alerts.filter(a => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter(a => a.triggered).length;

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'active'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('triggered')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'triggered'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Triggered ({triggeredCount})
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400">
            {filter === 'all' && 'No alerts yet'}
            {filter === 'active' && 'No active alerts'}
            {filter === 'triggered' && 'No triggered alerts'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
