'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Trade, UpdateTradeInput } from '@/types/pnl-tracker';
import { calculatePnL } from '@/lib/pnl-tracker/calculations';

interface TradeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: UpdateTradeInput) => Promise<boolean>;
  trade: Trade | null;
}

export function TradeEditModal({ isOpen, onClose, onUpdate, trade }: TradeEditModalProps) {
  const [formData, setFormData] = useState<UpdateTradeInput>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trade) {
      const openedAtStr = typeof trade.openedAt === 'string' 
        ? new Date(trade.openedAt).toISOString().slice(0, 16)
        : trade.openedAt.toISOString().slice(0, 16);
      
      const closedAtStr = trade.closedAt 
        ? (typeof trade.closedAt === 'string' 
            ? new Date(trade.closedAt).toISOString().slice(0, 16)
            : trade.closedAt.toISOString().slice(0, 16))
        : null;

      setFormData({
        asset: trade.asset,
        baseAsset: trade.baseAsset,
        type: trade.type,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        size: trade.size,
        fees: trade.fees,
        openedAt: openedAtStr,
        closedAt: closedAtStr,
        notes: trade.notes || '',
      });
    }
  }, [trade]);

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

  const estimatedPnL = formData.entryPrice && formData.exitPrice
    ? calculatePnL(formData.type || 'long', formData.entryPrice, formData.exitPrice, formData.size || 0, formData.fees || 0)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade) return;

    setError(null);
    setSubmitting(true);

    try {
      const success = await onUpdate(trade.id, formData);
      if (success) {
        onClose();
      }
    } catch (err) {
      let errorMessage = 'Failed to update trade';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (typeof window === 'undefined' || !trade) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-3xl shadow-2xl z-50"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Trade</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Asset</label>
                    <input
                      type="text"
                      value={formData.asset || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, asset: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Base Asset</label>
                    <select
                      value={formData.baseAsset || 'USDT'}
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

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Type</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
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
                        value="short"
                        checked={formData.type === 'short'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-5 h-5 text-red-500"
                      />
                      <span className="text-white">SHORT</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Entry Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.entryPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Exit Price</label>
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
                    <label className="block text-sm font-medium text-white mb-2">Size</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.size || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Fees</label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Open Date/Time</label>
                    <input
                      type="datetime-local"
                      value={formData.openedAt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, openedAt: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Close Date/Time</label>
                    <input
                      type="datetime-local"
                      value={formData.closedAt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, closedAt: e.target.value || null }))}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
                    rows={3}
                  />
                </div>

                {estimatedPnL && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Estimated PnL:</p>
                    <p className={`text-2xl font-bold ${estimatedPnL.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {estimatedPnL.pnl >= 0 ? '+' : ''}${estimatedPnL.pnl.toFixed(2)}
                      <span className="text-lg ml-2">({estimatedPnL.pnlPercent >= 0 ? '+' : ''}{estimatedPnL.pnlPercent.toFixed(2)}%)</span>
                    </p>
                  </div>
                )}

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
                    {submitting ? 'Updating...' : 'Update Trade'}
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
