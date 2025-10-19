'use client';

import { useState } from 'react';
import { Trade } from '@/lib/hooks/trades/useTrades';
import { Trash2, Download } from 'lucide-react';

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
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-8 w-28 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-12 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No trades yet</p>
        <p className="text-sm text-gray-500 mt-1">Add your first trade to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Recent Trades</h3>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-2 text-gray-400 font-medium">Date/Time</th>
              <th className="text-left py-2 px-2 text-gray-400 font-medium">Coin</th>
              <th className="text-left py-2 px-2 text-gray-400 font-medium">Side</th>
              <th className="text-right py-2 px-2 text-gray-400 font-medium">Entry</th>
              <th className="text-right py-2 px-2 text-gray-400 font-medium">Exit</th>
              <th className="text-right py-2 px-2 text-gray-400 font-medium">Size</th>
              <th className="text-right py-2 px-2 text-gray-400 font-medium">PnL</th>
              <th className="text-right py-2 px-2 text-gray-400 font-medium">%</th>
              <th className="text-center py-2 px-2 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const isProfit = trade.pnl >= 0;
              return (
                <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="py-2 px-2 text-white text-xs">
                    {formatDateTime(trade.entryTime)}
                  </td>
                  <td className="py-2 px-2 text-white font-medium">
                    {trade.coin}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      trade.side === 'LONG' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-white">
                    ${trade.entryPrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-white">
                    ${trade.exitPrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-white">
                    {trade.size.toFixed(4)}
                  </td>
                  <td className={`py-2 px-2 text-right font-bold ${
                    isProfit ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                  </td>
                  <td className={`py-2 px-2 text-right font-medium ${
                    isProfit ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isProfit ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => handleDelete(trade.id)}
                      disabled={deletingId === trade.id}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tags and Notes Section (expandable per trade) */}
      <div className="space-y-2">
        {trades.slice(0, 5).map((trade) => {
          if (!trade.notes && (!trade.tags || trade.tags.length === 0)) return null;
          
          return (
            <div key={`details-${trade.id}`} className="bg-gray-800/30 rounded-lg p-3 text-xs">
              <div className="text-gray-400 mb-1">
                {trade.coin} - {formatDateTime(trade.entryTime)}
              </div>
              {trade.notes && (
                <div className="text-gray-300 mb-1">
                  <span className="text-gray-500">Notes:</span> {trade.notes}
                </div>
              )}
              {trade.tags && trade.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {trade.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
