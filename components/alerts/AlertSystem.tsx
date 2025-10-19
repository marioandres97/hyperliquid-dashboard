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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Alert System 🔔</h2>
          <p className="text-xs text-gray-400 mt-1">
            Get notified about important market events
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Loading alerts...</p>
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
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => handleToggle(alert.id, alert.enabled)}
                          className={`p-0.5 rounded transition-colors ${
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
                        <div>
                          <h3 className="text-sm text-white font-medium">
                            {getAlertDescription(alert)}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                            {alert.triggered > 0 && (
                              <span>Triggered {alert.triggered}x</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notification Methods */}
                      <div className="flex gap-1.5 ml-6">
                        {alert.browserNotif && (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                            Browser
                          </span>
                        )}
                        {alert.emailNotif && (
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                            Email
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-400/80">
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
