'use client';

import { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertCreationForm } from './AlertCreationForm';
import { AlertsList } from './AlertsList';
import { AlertEditModal } from './AlertEditModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Plus, RefreshCw } from 'lucide-react';
import { getAlertDescription, type Alert, type CreateAlertInput, type UpdateAlertInput } from '@/types/alerts';
import { sendAlertPushNotification, requestNotificationPermission } from '@/lib/notifications/push';

export function AlertDashboard() {
  const { alerts, isLoading, error, createAlert, updateAlert, deleteAlert, refetch } = useAlerts();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [deletingAlert, setDeletingAlert] = useState<{ id: string; name: string } | null>(null);

  const handleCreate = async (input: CreateAlertInput) => {
    try {
      // Request notification permission if push is selected
      if (input.channels.includes('push')) {
        await requestNotificationPermission();
      }

      await createAlert(input);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert('Failed to create alert. Please try again.');
    }
  };

  const handleUpdate = async (id: string, input: UpdateAlertInput) => {
    try {
      await updateAlert(id, input);
      setEditingAlert(null);
    } catch (error) {
      console.error('Failed to update alert:', error);
      alert('Failed to update alert. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deletingAlert) return;
    
    try {
      await deleteAlert(deletingAlert.id);
      setDeletingAlert(null);
    } catch (error) {
      console.error('Failed to delete alert:', error);
      alert('Failed to delete alert. Please try again.');
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await updateAlert(id, { active: !currentActive });
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      alert('Failed to toggle alert. Please try again.');
    }
  };

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Alerts
          </h2>
          <p className="text-gray-400 text-sm">
            Create alerts for ANY cryptocurrency with multi-channel notifications
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showCreateForm ? 'Cancel' : 'Create Alert'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total Alerts</p>
          <p className="text-3xl font-semibold text-white">{alerts.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-2">Active</p>
          <p className="text-3xl font-semibold text-emerald-500">
            {alerts.filter(a => a.active && !a.triggered).length}
          </p>
        </div>
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-2">Triggered</p>
          <p className="text-3xl font-semibold text-amber-500">
            {alerts.filter(a => a.triggered).length}
          </p>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Create New Alert</h3>
          <AlertCreationForm
            onCreate={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && alerts.length === 0 && (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading alerts...</p>
        </div>
      )}

      {/* Alerts List */}
      {!isLoading && alerts.length > 0 && (
        <AlertsList
          alerts={alerts}
          onEdit={setEditingAlert}
          onDelete={(id) => {
            const alert = alerts.find(a => a.id === id);
            if (alert) {
              setDeletingAlert({
                id: alert.id,
                name: getAlertDescription(alert),
              });
            }
          }}
          onToggle={handleToggle}
        />
      )}

      {/* Empty State */}
      {!isLoading && alerts.length === 0 && !error && (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-400 mb-4">No alerts yet</p>
          <p className="text-gray-500 text-sm mb-6">
            Create your first alert to get notified about price movements
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Create Your First Alert
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingAlert && (
        <AlertEditModal
          isOpen={true}
          onClose={() => setEditingAlert(null)}
          onUpdate={handleUpdate}
          alert={editingAlert}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAlert && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeletingAlert(null)}
          onConfirm={handleDelete}
          alertName={deletingAlert.name}
        />
      )}
    </div>
  );
}
