'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade } from '@/types/pnl-tracker';
import { StatusBadge } from './StatusBadge';
import { Trash2, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface TradesTableProps {
  trades: Trade[];
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (trade: Trade) => void;
}

type SortField = 'openedAt' | 'asset' | 'pnl' | 'size';
type SortDirection = 'asc' | 'desc';

export function TradesTable({ trades, onDelete, onEdit }: TradesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('openedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterAsset, setFilterAsset] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPnL, setFilterPnL] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique assets
  const uniqueAssets = useMemo(() => {
    const assets = new Set(trades.map(t => t.asset));
    return Array.from(assets).sort();
  }, [trades]);

  // Filter and sort trades
  const filteredAndSortedTrades = useMemo(() => {
    let filtered = [...trades];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.asset.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Asset filter
    if (filterAsset !== 'all') {
      filtered = filtered.filter(t => t.asset === filterAsset);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // PnL filter
    if (filterPnL === 'winners') {
      filtered = filtered.filter(t => (t.pnl ?? 0) > 0);
    } else if (filterPnL === 'losers') {
      filtered = filtered.filter(t => (t.pnl ?? 0) < 0);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'openedAt') {
        aVal = new Date(a.openedAt).getTime();
        bVal = new Date(b.openedAt).getTime();
      } else if (sortField === 'pnl') {
        aVal = a.pnl ?? 0;
        bVal = b.pnl ?? 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [trades, searchQuery, filterAsset, filterStatus, filterPnL, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTrades.length / itemsPerPage);
  const paginatedTrades = filteredAndSortedTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

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

  const formatDate = (dateStr: string | Date) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return '-';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  if (trades.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-12 text-center">
        <p className="text-gray-400 text-lg">No trades yet</p>
        <p className="text-gray-500 text-sm mt-2">Add your first trade to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
          />

          {/* Asset Filter */}
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
          >
            <option value="all">All Assets</option>
            {uniqueAssets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          {/* PnL Filter */}
          <select
            value={filterPnL}
            onChange={(e) => setFilterPnL(e.target.value)}
            className="px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
          >
            <option value="all">All Trades</option>
            <option value="winners">Winners Only</option>
            <option value="losers">Losers Only</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-gray-400 text-sm">
            {filteredAndSortedTrades.length} trade{filteredAndSortedTrades.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('asset')}
                >
                  Asset <SortIcon field="asset" />
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Entry
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Exit
                </th>
                <th 
                  className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('size')}
                >
                  Size <SortIcon field="size" />
                </th>
                <th 
                  className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('pnl')}
                >
                  PnL <SortIcon field="pnl" />
                </th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Fees
                </th>
                <th 
                  className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                  onClick={() => handleSort('openedAt')}
                >
                  Opened <SortIcon field="openedAt" />
                </th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Closed
                </th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {paginatedTrades.map((trade) => {
                  const isProfit = (trade.pnl ?? 0) >= 0;
                  const rowBg = trade.status === 'closed' 
                    ? (isProfit ? 'hover:bg-emerald-500/5' : 'hover:bg-red-500/5')
                    : 'hover:bg-yellow-500/5';

                  return (
                    <motion.tr
                      key={trade.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`border-b border-gray-800 ${rowBg} transition-colors group`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            trade.status === 'open' 
                              ? 'bg-yellow-400' 
                              : isProfit ? 'bg-emerald-400' : 'bg-red-400'
                          }`} />
                          <StatusBadge status={trade.status} pnl={trade.pnl} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white font-bold">
                        {trade.asset}
                        <span className="text-xs text-gray-500 ml-1">/{trade.baseAsset}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
                          trade.type === 'long' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-white font-mono">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-white font-mono">
                        {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-300 font-mono">
                        {trade.size.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {trade.pnl !== null ? (
                          <div>
                            <div className={`text-base font-bold font-mono ${
                              isProfit ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {isProfit ? '+' : ''}${trade.pnl.toFixed(2)}
                            </div>
                            <div className={`text-xs font-mono ${
                              isProfit ? 'text-emerald-400/70' : 'text-red-400/70'
                            }`}>
                              ({isProfit ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-400 font-mono">
                        ${trade.fees.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                        {formatDate(trade.openedAt)}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                        {trade.closedAt ? formatDate(trade.closedAt) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(trade)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(trade.id)}
                            disabled={deletingId === trade.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
