'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { updateAlertSchema, type UpdateAlertInput, type NotificationChannel } from '@/types/alerts';
import { ChannelBadge } from './ChannelBadge';
import type { Alert } from '@/types/alerts';

interface AlertEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateAlertInput) => Promise<void>;
  alert: Alert;
}

const CHANNELS: NotificationChannel[] = ['push', 'email', 'telegram', 'whatsapp'];

export function AlertEditModal({ isOpen, onClose, onUpdate, alert }: AlertEditModalProps) {
  const [targetValue, setTargetValue] = useState(alert.targetValue.toString());
  const [channels, setChannels] = useState<NotificationChannel[]>(alert.channels);
  const [name, setName] = useState(alert.name || '');
  const [notes, setNotes] = useState(alert.notes || '');
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when alert changes
  useEffect(() => {
    if (isOpen) {
      setTargetValue(alert.targetValue.toString());
      setChannels(alert.channels);
      setName(alert.name || '');
      setNotes(alert.notes || '');
      setErrors({});
    }
  }, [isOpen, alert]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (originalOverflow) {
        document.body.style.overflow = originalOverflow;
      } else {
        document.body.style.removeProperty('overflow');
      }
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const input = {
      targetValue: parseFloat(targetValue),
      channels,
      name: name.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    // Validate with Zod
    const validation = updateAlertSchema.safeParse(input);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setUpdating(true);
    try {
      await onUpdate(alert.id, validation.data);
      onClose();
    } catch (error) {
      console.error('Error updating alert:', error);
    } finally {
      setUpdating(false);
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels(prev => 
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-emerald-500/20 rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="border-b border-gray-800 p-6 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-white">Edit Alert</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Alert Info (Read-only) */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Asset:</span>
                  <span className="text-white font-semibold">{alert.asset}/{alert.baseAsset}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{alert.type.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Value <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border ${
                    errors.targetValue ? 'border-red-500' : 'border-gray-700'
                  } focus:border-emerald-500 focus:outline-none`}
                  required
                />
                {errors.targetValue && (
                  <p className="mt-1 text-sm text-red-400">{errors.targetValue}</p>
                )}
              </div>

              {/* Notification Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notification Channels <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CHANNELS.map((channel) => (
                    <label
                      key={channel}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        channels.includes(channel)
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes(channel)}
                        onChange={() => toggleChannel(channel)}
                        className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                      />
                      <ChannelBadge channel={channel} size="sm" />
                    </label>
                  ))}
                </div>
                {errors.channels && (
                  <p className="mt-1 text-sm text-red-400">{errors.channels}</p>
                )}
              </div>

              {/* Alert Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alert Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {name.length}/100 characters
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {notes.length}/500 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updating ? 'Updating...' : 'Update Alert'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
