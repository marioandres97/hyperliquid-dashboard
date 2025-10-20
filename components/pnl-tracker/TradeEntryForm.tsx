'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { CreateTradeInput } from '@/types/pnl-tracker';
import { calculatePnL } from '@/lib/pnl-tracker/calculations';

interface TradeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTradeInput) => Promise<void>;
}

export function TradeEntryForm({ isOpen, onClose, onCreate }: TradeEntryFormProps) {
  const [formData, setFormData] = useState<CreateTradeInput>({
    asset: '',
    baseAsset: 'USDT',
    type: 'long',
    entryPrice: 0,
    exitPrice: null,
    size: 0,
    fees: 0,
    openedAt: new Date().toISOString().slice(0, 16),
    closedAt: null,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add escape key handler
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

  // Calculate estimated PnL
  const estimatedPnL = formData.entryPrice && formData.exitPrice
    ? calculatePnL(formData.type, formData.entryPrice, formData.exitPrice, formData.size, formData.fees)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.asset.trim()) {
      setError('Asset is required');
      return;
    }
    if (!formData.entryPrice || formData.entryPrice <= 0) {
      setError('Entry price must be greater than 0');
      return;
    }
    if (formData.exitPrice !== null && formData.exitPrice !== undefined && formData.exitPrice <= 0) {
      setError('Exit price must be greater than 0');
      return;
    }
    if (!formData.size || formData.size <= 0) {
      setError('Size must be greater than 0');
      return;
    }
    if (formData.fees !== undefined && formData.fees < 0) {
      setError('Fees cannot be negative');
      return;
    }
    if (formData.closedAt && formData.openedAt && new Date(formData.closedAt) <= new Date(formData.openedAt)) {
      setError('Close date must be after open date');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(formData);
      // Reset form
      setFormData({
        asset: '',
        baseAsset: 'USDT',
        type: 'long',
        entryPrice: 0,
        exitPrice: null,
        size: 0,
        fees: 0,
        openedAt: new Date().toISOString().slice(0, 16),
        closedAt: null,
        notes: '',
      });
    } catch (err) {
      let errorMessage = 'Failed to create trade';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-3xl shadow-2xl z-50"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add Trade</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Asset and Base Asset */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Asset <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.asset}
                      onChange={(e) => setFormData(prev => ({ ...prev, asset: e.target.value.toUpperCase() }))}
                      placeholder="BTC, ETH, SOL, etc."
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Base Asset <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.baseAsset}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseAsset: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    >
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="USD">USD</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Type */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="long"
                        checked={formData.type === 'long'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-5 h-5 text-green-500"
                      />
                      <span className="text-white">LONG</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="short"
                        checked={formData.type === 'short'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-5 h-5 text-red-500"
                      />
                      <span className="text-white">SHORT</span>
                    </label>
                  </div>
                </div>

                {/* Row 3: Entry Price, Exit Price, Size */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Entry Price <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.entryPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Exit Price <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.exitPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Size <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.size || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Row 4: Fees */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Fees <span className="text-gray-500 text-xs">(defaults to 0)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fees || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, fees: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 5: Open and Close Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Open Date/Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.openedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, openedAt: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Close Date/Time <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.closedAt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, closedAt: e.target.value || null }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 6: Notes */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Notes <span className="text-gray-500 text-xs">(max 500 chars)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
                    rows={3}
                    placeholder="Add any notes about this trade..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.notes?.length || 0} / 500</p>
                </div>

                {/* Estimated PnL */}
                {estimatedPnL && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Estimated PnL:</p>
                    <p className={`text-2xl font-bold ${estimatedPnL.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {estimatedPnL.pnl >= 0 ? '+' : ''}${estimatedPnL.pnl.toFixed(2)}
                      <span className="text-lg ml-2">({estimatedPnL.pnlPercent >= 0 ? '+' : ''}{estimatedPnL.pnlPercent.toFixed(2)}%)</span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {submitting ? 'Saving...' : 'Save Trade'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
