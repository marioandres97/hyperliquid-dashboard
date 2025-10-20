'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade } from '@/lib/hooks/trades/useTrades';
import { Trash2, Download } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';

interface TradeHistoryTableProps {
  trades: Trade[];
  onDelete: (id: string) => Promise<boolean>;
  onExport: () => void;
  loading?: boolean;
}

export function TradeHistoryTable({ trades, onDelete, onExport, loading }: TradeHistoryTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trade?')) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-8 w-28 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl mb-4">
          <Download className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-base font-medium text-gray-400">No trades yet</p>
        <p className="text-sm text-gray-500 mt-1">Add your first trade to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Trade History</h3>
        <PremiumButton
          onClick={onExport}
          variant="secondary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
        >
          Export CSV
        </PremiumButton>
      </div>

      {/* Bloomberg-Style Table */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl" />
        <div className="absolute inset-0 border border-white/10 rounded-xl" />

        <div className="relative overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date/Time</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Coin</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Side</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Exit</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">PnL</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">%</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {trades.map((trade, index) => {
                  const isProfit = trade.pnl >= 0;
                  return (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                        {formatDateTime(trade.entryTime)}
                      </td>
                      <td className="py-3 px-4 text-sm text-white font-bold">
                        {trade.coin}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
                          trade.side === 'LONG' 
                            ? 'bg-green-500/20 text-green-400 shadow-sm shadow-green-500/20' 
                            : 'bg-red-500/20 text-red-400 shadow-sm shadow-red-500/20'
                        }`}>
                          {trade.side}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-white font-mono">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-white font-mono">
                        ${trade.exitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-300 font-mono">
                        {trade.size.toFixed(4)}
                      </td>
                      <td className={`py-3 px-4 text-right text-base font-bold font-mono ${
                        isProfit ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold font-mono ${
                        isProfit ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(trade.id)}
                          disabled={deletingId === trade.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tags and Notes Section */}
      {(() => {
        const tradesWithDetails = trades.slice(0, 5);
        const hasDetails = tradesWithDetails.some(trade => trade.notes || (trade.tags && trade.tags.length > 0));
        
        if (!hasDetails) return null;
        
        return (
          <div className="space-y-2">
            {tradesWithDetails.map((trade) => {
              if (!trade.notes && (!trade.tags || trade.tags.length === 0)) return null;
              
              return (
                <div key={`details-${trade.id}`} className="relative rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-sm" />
                  <div className="relative p-3 border border-white/5 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1 font-mono">
                      {trade.coin} - {formatDateTime(trade.entryTime)}
                    </div>
                    {trade.notes && (
                      <div className="text-sm text-gray-300 mb-1">
                        <span className="text-gray-500">Notes:</span> {trade.notes}
                      </div>
                    )}
                    {trade.tags && trade.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trade.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
