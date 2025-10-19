'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CreateTradeInput } from '@/lib/hooks/trades/useTrades';

interface TradeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTradeInput) => Promise<void>;
}

export function TradeEntryModal({ isOpen, onClose, onCreate }: TradeEntryModalProps) {
  const [formData, setFormData] = useState<CreateTradeInput>({
    coin: 'BTC',
    side: 'LONG',
    entryPrice: 0,
    exitPrice: 0,
    size: 0,
    entryTime: new Date().toISOString().slice(0, 16),
    exitTime: new Date().toISOString().slice(0, 16),
    notes: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add escape key handler and body scroll prevention
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
      // Restore original overflow or remove the property if it was empty
      if (originalOverflow) {
        document.body.style.overflow = originalOverflow;
      } else {
        document.body.style.removeProperty('overflow');
      }
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.entryPrice <= 0) {
      setError('Entry price must be greater than 0');
      return;
    }
    if (formData.exitPrice <= 0) {
      setError('Exit price must be greater than 0');
      return;
    }
    if (formData.size <= 0) {
      setError('Size must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(formData);
      // Reset form only if successful (onCreate will handle closing modal)
      setFormData({
        coin: 'BTC',
        side: 'LONG',
        entryPrice: 0,
        exitPrice: 0,
        size: 0,
        entryTime: new Date().toISOString().slice(0, 16),
        exitTime: new Date().toISOString().slice(0, 16),
        notes: '',
        tags: [],
      });
      setTagInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const tag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
      if (!formData.tags?.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  // Use portal to render modal outside parent DOM hierarchy
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc(100%-2rem)] md:max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border-0 md:border border-gray-700 rounded-none md:rounded-xl shadow-2xl z-50"
          >
      <div className="p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-gray-900 pb-3 sm:pb-4 border-b border-gray-800 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white">Add Trade</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Coin */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Coin
            </label>
            <select
              value={formData.coin}
              onChange={(e) => setFormData(prev => ({ ...prev, coin: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="HYPE">HYPE</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
            </select>
          </div>

          {/* Side */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Side
            </label>
            <div className="flex gap-2 sm:gap-3">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] py-2">
                <input
                  type="radio"
                  name="side"
                  value="LONG"
                  checked={formData.side === 'LONG'}
                  onChange={(e) => setFormData(prev => ({ ...prev, side: e.target.value }))}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"
                />
                <span className="text-white text-sm sm:text-base">LONG</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px] py-2">
                <input
                  type="radio"
                  name="side"
                  value="SHORT"
                  checked={formData.side === 'SHORT'}
                  onChange={(e) => setFormData(prev => ({ ...prev, side: e.target.value }))}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                />
                <span className="text-white text-sm sm:text-base">SHORT</span>
              </label>
            </div>
          </div>

          {/* Entry Price */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Entry Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.entryPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
                required
              />
            </div>
          </div>

          {/* Exit Price */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Exit Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.exitPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
                required
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Size ({formData.coin})
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.size || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
              required
            />
          </div>

          {/* Entry Time */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Entry Time
            </label>
            <input
              type="datetime-local"
              value={formData.entryTime}
              onChange={(e) => setFormData(prev => ({ ...prev, entryTime: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
              required
            />
          </div>

          {/* Exit Time */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Exit Time
            </label>
            <input
              type="datetime-local"
              value={formData.exitTime}
              onChange={(e) => setFormData(prev => ({ ...prev, exitTime: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Add any notes about this trade..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white mb-1.5 sm:mb-2">
              Tags (optional)
            </label>
            <div className="flex gap-1.5 sm:gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g., WhaleFollowing"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 sm:px-4 py-2.5 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs sm:text-sm transition-colors min-h-[44px] whitespace-nowrap"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-300 min-w-[20px] min-h-[20px] flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto sm:flex-1 px-4 py-2.5 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors min-h-[44px] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto sm:flex-1 px-4 py-2.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
            >
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
