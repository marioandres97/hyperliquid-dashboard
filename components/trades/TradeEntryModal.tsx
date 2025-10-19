'use client';

import { useState } from 'react';
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

  if (!isOpen) return null;

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
      // Reset form
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
      onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add Trade</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coin */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Coin
            </label>
            <select
              value={formData.coin}
              onChange={(e) => setFormData(prev => ({ ...prev, coin: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
            <label className="block text-sm font-medium text-white mb-2">
              Side
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="side"
                  value="LONG"
                  checked={formData.side === 'LONG'}
                  onChange={(e) => setFormData(prev => ({ ...prev, side: e.target.value }))}
                  className="w-4 h-4 text-green-500"
                />
                <span className="text-white">LONG</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="side"
                  value="SHORT"
                  checked={formData.side === 'SHORT'}
                  onChange={(e) => setFormData(prev => ({ ...prev, side: e.target.value }))}
                  className="w-4 h-4 text-red-500"
                />
                <span className="text-white">SHORT</span>
              </label>
            </div>
          </div>

          {/* Entry Price */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Entry Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.entryPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Exit Price */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Exit Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                value={formData.exitPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Size ({formData.coin})
            </label>
            <input
              type="number"
              step="0.001"
              value={formData.size || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, size: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Entry Time */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Entry Time
            </label>
            <input
              type="datetime-local"
              value={formData.entryTime}
              onChange={(e) => setFormData(prev => ({ ...prev, entryTime: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Exit Time */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Exit Time
            </label>
            <input
              type="datetime-local"
              value={formData.exitTime}
              onChange={(e) => setFormData(prev => ({ ...prev, exitTime: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Add any notes about this trade..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
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
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
