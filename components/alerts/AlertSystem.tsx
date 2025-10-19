'use client';

import { useState, useEffect } from 'react';
import { useAlerts } from '@/lib/hooks/alerts/useAlerts';
import { useAlertMonitoring } from '@/lib/hooks/alerts/useAlertMonitoring';
import { CreateAlertModal } from './CreateAlertModal';
import { getAlertDescription } from '@/lib/alerts/types';
import { Plus, Trash2, Bell, BellOff } from 'lucide-react';
import type { CreateAlertInput } from '@/lib/alerts/types';
import { PremiumCard } from '@/components/shared/PremiumCard';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { PremiumBadge } from '@/components/shared/PremiumBadge';

export function AlertSystem() {
  const { alerts, loading, error, createAlert, updateAlert, deleteAlert, refetch } = useAlerts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Set up alert monitoring
  useAlertMonitoring({
    alerts,
    onAlertTriggered: (alert) => {
      // Refetch alerts to update triggered count
      refetch();
    },
    enabled: true,
  });

  // Request notification permission on mount if there are alerts with browserNotif enabled
  useEffect(() => {
    const hasNotificationAlerts = alerts.some(a => a.enabled && a.browserNotif);
    if (hasNotificationAlerts && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(err => {
          console.error('Error requesting notification permission:', err);
        });
      }
    }
  }, [alerts]);

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
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Alert System</h2>
            <p className="text-xs text-gray-400 mt-1">
              Get notified about important market events
            </p>
          </div>
        </div>
        <PremiumButton
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          size="md"
        >
          Create Alert
        </PremiumButton>
      </div>

      {/* Loading State - Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="skeleton w-10 h-10 rounded-lg" />
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
        <PremiumCard glow="red" hover={false} className="p-4">
          <p className="text-sm text-red-400">Error: {error}</p>
        </PremiumCard>
      )}

      {/* Active Alerts */}
      {!loading && !error && (
        <>
          {alerts.length === 0 ? (
            <PremiumCard hover={false} className="p-8 text-center">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">No alerts yet</p>
              <p className="text-xs text-white/20 mt-2">
                Create your first alert to get started
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <PremiumCard 
                  key={alert.id} 
                  hover={true}
                  glow={alert.enabled ? 'blue' : 'none'}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          onClick={() => handleToggle(alert.id, alert.enabled)}
                          className={`p-2 rounded-lg transition-all min-w-[40px] min-h-[40px] flex items-center justify-center ${
                            alert.enabled
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          {alert.enabled ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-white font-semibold mb-1 line-clamp-2">
                            {getAlertDescription(alert)}
                          </h3>
                          {alert.triggered > 0 && (
                            <p className="text-xs text-white/50">
                              Triggered {alert.triggered} time{alert.triggered !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Notification Methods */}
                      <div className="flex gap-2 ml-[52px]">
                        {alert.browserNotif && (
                          <PremiumBadge variant="info" size="sm">
                            Browser
                          </PremiumBadge>
                        )}
                        {alert.emailNotif && (
                          <PremiumBadge variant="neutral" size="sm">
                            Email
                          </PremiumBadge>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all min-w-[40px] min-h-[40px] flex items-center justify-center flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 backdrop-blur-sm">
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
