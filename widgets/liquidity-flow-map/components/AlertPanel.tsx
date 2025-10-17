'use client';

import React, { useState } from 'react';
import type { Alert, AlertSeverity } from '../types';

export interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onAcknowledgeAll?: () => void;
  maxVisible?: number;
}

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: 'border-red-500 bg-red-500/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-yellow-500 bg-yellow-500/10',
  low: 'border-blue-500 bg-blue-500/10',
  info: 'border-gray-500 bg-gray-500/10',
};

const SEVERITY_ICONS: Record<AlertSeverity, string> = {
  critical: '🚨',
  high: '⚠️',
  medium: '⚡',
  low: 'ℹ️',
  info: '💡',
};

const SEVERITY_TEXT_COLORS: Record<AlertSeverity, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
  info: 'text-gray-400',
};

export function AlertPanel({ 
  alerts, 
  onAcknowledge, 
  onAcknowledgeAll,
  maxVisible = 5 
}: AlertPanelProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Filter unacknowledged alerts
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  
  // Sort by severity and timestamp
  const sortedAlerts = [...unacknowledgedAlerts].sort((a, b) => {
    const severityOrder = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.timestamp - a.timestamp;
  });

  const visibleAlerts = expanded ? sortedAlerts : sortedAlerts.slice(0, maxVisible);
  const hasMore = sortedAlerts.length > maxVisible;

  if (sortedAlerts.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Alerts</h3>
          <span className="text-xs text-white/60">No active alerts</span>
        </div>
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">✅</span>
          <p className="text-white/60">All clear! No alerts at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-white">Alerts</h3>
          {sortedAlerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {sortedAlerts.length}
            </span>
          )}
        </div>
        
        {onAcknowledgeAll && sortedAlerts.length > 0 && (
          <button
            onClick={onAcknowledgeAll}
            className="text-sm text-white/60 hover:text-white transition-colors underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-4 border-l-4 ${SEVERITY_COLORS[alert.severity]} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{SEVERITY_ICONS[alert.severity]}</span>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${SEVERITY_TEXT_COLORS[alert.severity]}`}>
                      {alert.title}
                    </h4>
                    <span className="text-xs text-white/50 uppercase font-semibold">
                      {alert.coin}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/80 mb-2">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>
                      💰 ${alert.price.toFixed(2)}
                    </span>
                    <span>
                      🕐 {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Metadata preview */}
                  {Object.keys(alert.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(alert.metadata).slice(0, 3).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10"
                          >
                            <span className="text-white/50">{key}:</span>{' '}
                            <span className="text-white/80">
                              {typeof value === 'number' && value > 100
                                ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                                : String(value)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-white/40 hover:text-white transition-colors text-xl"
                  title="Acknowledge alert"
                >
                  ✓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full mt-3 py-2 text-sm text-white/60 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
        >
          Show {sortedAlerts.length - maxVisible} more alert{sortedAlerts.length - maxVisible !== 1 ? 's' : ''}
        </button>
      )}

      {expanded && hasMore && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full mt-3 py-2 text-sm text-white/60 hover:text-white transition-colors border border-white/10 rounded-lg hover:bg-white/5"
        >
          Show less
        </button>
      )}
    </div>
  );
}
