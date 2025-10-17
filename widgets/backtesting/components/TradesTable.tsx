'use client';

import { useState } from 'react';
import { Trade } from '../types';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface TradesTableProps {
  trades: Trade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;

  if (trades.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
        <p className="text-white/60">No trades executed</p>
      </div>
    );
  }

  const totalPages = Math.ceil(trades.length / tradesPerPage);
  const startIndex = (currentPage - 1) * tradesPerPage;
  const endIndex = startIndex + tradesPerPage;
  const currentTrades = trades.slice(startIndex, endIndex);

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, HH:mm');
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70">Trade History</h3>
        <p className="text-xs text-white/50 mt-1">
          Showing {startIndex + 1}-{Math.min(endIndex, trades.length)} of {trades.length} trades
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Side</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Entry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Exit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">PnL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">PnL %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Hold</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Costs</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60">Exit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {currentTrades.map((trade, index) => {
              const isProfitable = trade.pnl > 0;
              
              return (
                <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {trade.side === 'long' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs font-medium ${
                        trade.side === 'long' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.side.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white/80">
                      ${trade.entryPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-white/50">
                      {formatDate(trade.entryTime)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white/80">
                      ${trade.exitPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-white/50">
                      {formatDate(trade.exitTime)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-white/80">
                      ${trade.size.toFixed(2)}
                    </div>
                    <div className="text-xs text-white/50">
                      {trade.leverage}x
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${
                      isProfitable ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isProfitable ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${
                      isProfitable ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isProfitable ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/80">
                      {trade.holdingTime.toFixed(1)}h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-orange-400">
                      ${trade.totalCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-white/50">
                      F: ${trade.fees.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      trade.exitReason === 'takeProfit' ? 'bg-green-500/20 text-green-400' :
                      trade.exitReason === 'stopLoss' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {trade.exitReason === 'takeProfit' ? 'TP' :
                       trade.exitReason === 'stopLoss' ? 'SL' :
                       trade.exitReason === 'signal' ? 'Signal' : 'End'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              currentPage === 1
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20 transition-colors'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              currentPage === totalPages
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20 transition-colors'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
