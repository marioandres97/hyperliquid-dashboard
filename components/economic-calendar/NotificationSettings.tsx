'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Bell } from 'lucide-react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  sendTestNotification,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '@/lib/economic-calendar/notifications';
import type { NotificationSettings as NotificationSettingsType } from '@/types/economic-calendar';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMING_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
];

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    enabled: false,
    timings: [5, 15, 30],
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showTestSuccess, setShowTestSuccess] = useState(false);

  useEffect(() => {
    setSettings(getNotificationSettings());
    setPermission(getNotificationPermission());
  }, [isOpen]);

  const handleEnableToggle = async () => {
    if (!settings.enabled && permission !== 'granted') {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission !== 'granted') {
        return;
      }
    }

    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTimingToggle = (timing: number) => {
    const newTimings = settings.timings.includes(timing)
      ? settings.timings.filter((t) => t !== timing)
      : [...settings.timings, timing].sort((a, b) => a - b);

    const newSettings = { ...settings, timings: newTimings };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTestNotification = () => {
    sendTestNotification();
    setShowTestSuccess(true);
    setTimeout(() => setShowTestSuccess(false), 3000);
  };

  if (!isNotificationSupported()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-emerald-500/20 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Settings className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Notification Settings
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Permission Status */}
              {permission !== 'granted' && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-400">
                    {permission === 'denied'
                      ? '⚠️ Notifications are blocked. Please enable them in your browser settings.'
                      : '🔔 Enable notifications to receive alerts before events.'}
                  </p>
                </div>
              )}

              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Enable Notifications
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Get notified before subscribed events
                  </p>
                </div>
                <button
                  onClick={handleEnableToggle}
                  disabled={permission === 'denied'}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.enabled
                      ? 'bg-emerald-500'
                      : 'bg-gray-700'
                  } ${permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                    animate={{ x: settings.enabled ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Timing Options */}
              <div>
                <p className="text-sm font-semibold text-gray-400 mb-3">
                  Notify me before event:
                </p>
                <div className="space-y-2">
                  {TIMING_OPTIONS.map((option) => {
                    const isSelected = settings.timings.includes(option.value);
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleTimingToggle(option.value)}
                        disabled={!settings.enabled}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                        } ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Test Notification */}
              <div>
                <button
                  onClick={handleTestNotification}
                  disabled={permission !== 'granted' || !settings.enabled}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                    permission === 'granted' && settings.enabled
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    Send Test Notification
                  </span>
                </button>
                
                <AnimatePresence>
                  {showTestSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-sm text-emerald-400 mt-2"
                    >
                      ✓ Test notification sent!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Info */}
              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                <p className="text-xs text-gray-400">
                  💡 You can subscribe to specific events by clicking the bell icon
                  on each event card. Notifications will be sent at your selected
                  times before each subscribed event.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
