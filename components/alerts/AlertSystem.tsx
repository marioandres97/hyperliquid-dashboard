'use client';

import { useState } from 'react';
import { useAlerts } from '@/lib/hooks/alerts/useAlerts';
import { CreateAlertModal } from './CreateAlertModal';
import { getAlertDescription } from '@/lib/alerts/types';
import { Plus, Trash2, Bell, BellOff } from 'lucide-react';
import type { CreateAlertInput } from '@/lib/alerts/types';

export function AlertSystem() {
  const { alerts, loading, error, createAlert, updateAlert, deleteAlert } = useAlerts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = async (input: CreateAlertInput) => {
    const result = await createAlert(input);
    if (result) {
      // Request browser notification permission
      if (input.browserNotif && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await updateAlert(id, { enabled: !enabled });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      await deleteAlert(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Alert System</h2>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
              Get notified about important market events
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Loading State - Skeleton */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="skeleton w-4 h-4 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Active Alerts */}
      {!loading && !error && (
        <>
          {alerts.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-center">
              <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No alerts yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-2.5 sm:p-3 lg:p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => handleToggle(alert.id, alert.enabled)}
                          className={`p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                            alert.enabled
                              ? 'text-green-400 hover:text-green-300'
                              : 'text-gray-600 hover:text-gray-500'
                          }`}
                        >
                          {alert.enabled ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm text-white font-medium line-clamp-2">
                            {getAlertDescription(alert)}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-xs text-gray-400">
                            {alert.triggered > 0 && (
                              <span>Triggered {alert.triggered}x</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notification Methods */}
                      <div className="flex gap-1.5 ml-[52px]">
                        {alert.browserNotif && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] sm:text-xs">
                            Browser
                          </span>
                        )}
                        {alert.emailNotif && (
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] sm:text-xs">
                            Email
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 sm:p-3">
        <p className="text-[10px] sm:text-xs text-blue-400/80">
          💡 Alerts are checked every 5 seconds. Browser notifications require permission.
        </p>
      </div>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
