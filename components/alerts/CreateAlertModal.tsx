'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

  // Add escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - SEPARATE element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal - SEPARATE element, floats above */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc(100%-2rem)] md:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 border-0 md:border border-gray-800 rounded-none md:rounded-xl shadow-2xl z-50"
          >
        {/* Header */}
        <div className="border-b border-gray-800 p-4 sm:p-5 md:p-6 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white">Create Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
          {/* Alert Type */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Alert Type
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {(['price', 'large_order', 'volume'] as AlertType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] ${
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
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Coin
            </label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value as AlertCoin)}
              className="w-full px-3 py-2.5 sm:py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm min-h-[44px]"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Condition
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {(['above', 'below'] as AlertCondition[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] ${
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
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Side
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {(['BUY', 'SELL', 'BOTH'] as AlertSide[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`px-2 sm:px-3 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] ${
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
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
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
              className="w-full px-3 py-2.5 sm:py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm min-h-[44px]"
              required
            />
          </div>

          {/* Notification Preferences */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-300">
              Notification Methods
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] py-2">
                <input
                  type="checkbox"
                  checked={browserNotif}
                  onChange={(e) => setBrowserNotif(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700"
                />
                <span className="text-xs sm:text-sm text-gray-300">Browser Notification</span>
              </label>
              <label className="flex items-center gap-2 cursor-not-allowed opacity-50 min-h-[44px] py-2">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  disabled
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700"
                />
                <span className="text-xs sm:text-sm text-gray-300">Email Notification (PRO)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto sm:flex-1 px-4 py-2.5 sm:py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="w-full sm:w-auto sm:flex-1 px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
            >
              {creating ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
