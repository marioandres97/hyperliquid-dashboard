'use client';

import { useState } from 'react';
import type { CreateAlertInput, AlertType, AlertCoin, AlertCondition, AlertSide } from '@/lib/alerts/types';
import { X } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateAlertInput) => Promise<void>;
}

export function CreateAlertModal({ isOpen, onClose, onCreate }: CreateAlertModalProps) {
  const [type, setType] = useState<AlertType>('price');
  const [coin, setCoin] = useState<AlertCoin>('BTC');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [value, setValue] = useState<string>('');
  const [side, setSide] = useState<AlertSide>('BUY');
  const [browserNotif, setBrowserNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      alert('Please enter a valid value');
      return;
    }

    setCreating(true);

    try {
      const input: CreateAlertInput = {
        type,
        coin,
        value: parsedValue,
        browserNotif,
        emailNotif,
      };

      if (type === 'price') {
        input.condition = condition;
      }

      if (type === 'large_order') {
        input.side = side;
      }

      await onCreate(input);
      
      // Reset form
      setValue('');
      onClose();
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['price', 'large_order', 'volume'] as AlertType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {t === 'large_order' ? 'Order' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Coin Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coin
            </label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value as AlertCoin)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="HYPE">HYPE</option>
              {type === 'large_order' && <option value="ALL">ALL</option>}
            </select>
          </div>

          {/* Price Alert Fields */}
          {type === 'price' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['above', 'below'] as AlertCondition[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      condition === c
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Large Order Alert Fields */}
          {type === 'large_order' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Side
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BUY', 'SELL', 'BOTH'] as AlertSide[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      side === s
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {type === 'price' ? 'Target Price ($)' :
               type === 'large_order' ? 'Minimum Size ($)' :
               'Volume Spike (%)'}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                type === 'price' ? '50000' :
                type === 'large_order' ? '100000' :
                '200'
              }
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Notification Preferences */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Notification Methods
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserNotif}
                  onChange={(e) => setBrowserNotif(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                />
                <span className="text-sm text-gray-300">Browser Notification</span>
              </label>
              <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  disabled
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                />
                <span className="text-sm text-gray-300">Email Notification (PRO)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
