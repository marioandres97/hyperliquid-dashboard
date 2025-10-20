'use client';

import { useState } from 'react';
import { alertSchema, type CreateAlertInput, type BaseAsset, type NotificationChannel } from '@/types/alerts';
import { ChannelBadge } from './ChannelBadge';
import { Bell } from 'lucide-react';

interface AlertCreationFormProps {
  onCreate: (input: CreateAlertInput) => Promise<void>;
  onCancel?: () => void;
}

const BASE_ASSETS: BaseAsset[] = ['USDT', 'USDC', 'USD', 'BTC', 'ETH'];
const ALERT_TYPES = [
  { value: 'price_above' as const, label: 'Price Above' },
  { value: 'price_below' as const, label: 'Price Below' },
  { value: 'volume_spike' as const, label: 'Volume Spike' },
];
const CHANNELS: NotificationChannel[] = ['push', 'email', 'telegram', 'whatsapp'];

export function AlertCreationForm({ onCreate, onCancel }: AlertCreationFormProps) {
  const [asset, setAsset] = useState('');
  const [baseAsset, setBaseAsset] = useState<BaseAsset>('USDT');
  const [type, setType] = useState<'price_above' | 'price_below' | 'volume_spike'>('price_above');
  const [targetValue, setTargetValue] = useState('');
  const [channels, setChannels] = useState<NotificationChannel[]>(['push']);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const input = {
      asset: asset.trim().toUpperCase(),
      baseAsset,
      type,
      targetValue: parseFloat(targetValue),
      channels,
      name: name.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    // Validate with Zod
    const validation = alertSchema.safeParse(input);
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

    setCreating(true);
    try {
      await onCreate(validation.data);
      // Reset form
      setAsset('');
      setTargetValue('');
      setName('');
      setNotes('');
      setChannels(['push']);
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setCreating(false);
    }
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels(prev => 
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Asset Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Asset <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          placeholder="e.g., SOL, DOGE, AVAX, BTC"
          className={`w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border ${
            errors.asset ? 'border-red-500' : 'border-gray-700'
          } focus:border-emerald-500 focus:outline-none`}
          required
        />
        {errors.asset && (
          <p className="mt-1 text-sm text-red-400">{errors.asset}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter any cryptocurrency symbol (e.g., SOL, DOGE, AVAX)
        </p>
      </div>

      {/* Base Asset Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Base Asset <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {BASE_ASSETS.map((ba) => (
            <button
              key={ba}
              type="button"
              onClick={() => setBaseAsset(ba)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                baseAsset === ba
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {ba}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Alert Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ALERT_TYPES.map((at) => (
            <button
              key={at.value}
              type="button"
              onClick={() => setType(at.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                type === at.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {at.label}
            </button>
          ))}
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
          placeholder={type === 'volume_spike' ? '50 (for 50%)' : '100'}
          className={`w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border ${
            errors.targetValue ? 'border-red-500' : 'border-gray-700'
          } focus:border-emerald-500 focus:outline-none`}
          required
        />
        {errors.targetValue && (
          <p className="mt-1 text-sm text-red-400">{errors.targetValue}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {type === 'volume_spike' 
            ? 'Percentage increase in volume'
            : `Target price in ${baseAsset}`
          }
        </p>
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

      {/* Alert Name (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Alert Name (Optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., SOL Break $150"
          maxLength={100}
          className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {name.length}/100 characters
        </p>
      </div>

      {/* Notes (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this alert..."
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={creating}
          className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4" />
          {creating ? 'Creating...' : 'Create Alert'}
        </button>
      </div>
    </form>
  );
}
