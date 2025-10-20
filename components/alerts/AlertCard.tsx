'use client';

import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { ChannelBadge } from './ChannelBadge';
import { StatusBadge } from './StatusBadge';
import { getAlertDescription } from '@/types/alerts';
import type { Alert } from '@/types/alerts';

interface AlertCardProps {
  alert: Alert;
  onEdit?: (alert: Alert) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, active: boolean) => void;
}

export function AlertCard({ alert, onEdit, onDelete, onToggle }: AlertCardProps) {
  const isTriggered = alert.triggered;
  const isActive = alert.active;

  return (
    <div
      className={`backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 ${
        isTriggered
          ? 'bg-emerald-500/10 border border-emerald-500/30'
          : 'bg-gray-900/30 border border-emerald-500/10 hover:border-emerald-500/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {getAlertDescription(alert)}
          </h3>
          <div className="flex gap-2">
            {isTriggered && <StatusBadge status="triggered" size="sm" />}
            {!isTriggered && <StatusBadge status={isActive ? 'active' : 'inactive'} size="sm" />}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {onToggle && !isTriggered && (
            <button
              onClick={() => onToggle(alert.id, isActive)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              title={isActive ? 'Deactivate' : 'Activate'}
            >
              {isActive ? (
                <ToggleRight className="w-5 h-5 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
          )}
          {onEdit && !isTriggered && (
            <button
              onClick={() => onEdit(alert)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              title="Edit alert"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(alert.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete alert"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* Current vs Target */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Target:</span>
          <span className="text-white font-semibold">
            {alert.targetValue.toLocaleString()} {alert.baseAsset}
          </span>
        </div>
        
        {alert.currentValue && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current:</span>
            <span className={`font-semibold ${
              isTriggered ? 'text-emerald-400' : 'text-gray-300'
            }`}>
              {alert.currentValue.toLocaleString()} {alert.baseAsset}
            </span>
          </div>
        )}

        {/* Triggered info */}
        {alert.triggeredAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Triggered:</span>
            <span className="text-emerald-400">
              {new Date(alert.triggeredAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* Trigger count */}
        {alert.triggeredCount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Times triggered:</span>
            <span className="text-white">{alert.triggeredCount}</span>
          </div>
        )}

        {/* Notes */}
        {alert.notes && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400 italic">{alert.notes}</p>
          </div>
        )}

        {/* Channels */}
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Notification Channels:</p>
          <div className="flex flex-wrap gap-2">
            {alert.channels.map((channel) => (
              <ChannelBadge key={channel} channel={channel} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
