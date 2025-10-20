'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTrades } from '@/hooks/useTrades';
import { useToastContext } from '@/lib/hooks/ToastContext';
import { TradeEntryForm } from './TradeEntryForm';
import { TradeEditModal } from './TradeEditModal';
import { MetricsGrid } from './MetricsGrid';
import { PnLChart } from './PnLChart';
import { TradesTable } from './TradesTable';
import { calculateMetrics } from '@/lib/pnl-tracker/calculations';
import { Trade, CreateTradeInput, UpdateTradeInput } from '@/types/pnl-tracker';

export function PnLTrackerMain() {
  const { trades, loading, createTrade, updateTrade, deleteTrade } = useTrades();
  const toast = useToastContext();
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const metrics = calculateMetrics(trades);

  const handleCreateTrade = async (input: CreateTradeInput) => {
    try {
      const result = await createTrade(input);
      if (result) {
        toast.success('Trade registered successfully! ✅');
        setIsEntryFormOpen(false);
      } else {
        toast.error('Failed to register trade. Please try again. ❌');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register trade. Please try again. ❌';
      toast.error(errorMsg);
      throw err; // Re-throw to let form handle it
    }
  };

  const handleUpdateTrade = async (id: string, updates: UpdateTradeInput) => {
    try {
      const success = await updateTrade(id, updates);
      if (success) {
        toast.success('Trade updated successfully! ✅');
        setIsEditModalOpen(false);
        setEditingTrade(null);
        return true;
      } else {
        toast.error('Failed to update trade. Please try again. ❌');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update trade. Please try again. ❌';
      toast.error(errorMsg);
      return false;
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      const success = await deleteTrade(id);
      if (success) {
        toast.success('Trade deleted successfully! ✅');
        return true;
      } else {
        toast.error('Failed to delete trade. Please try again. ❌');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete trade. Please try again. ❌';
      toast.error(errorMsg);
      return false;
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">Loading PnL data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Add Trade Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Trading Journal</h2>
          <p className="text-gray-400 mt-1">Track and analyze your trading performance</p>
        </div>
        <button
          onClick={() => setIsEntryFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Trade
        </button>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid metrics={metrics} />

      {/* P&L Chart */}
      <PnLChart trades={trades} />

      {/* Trades Table */}
      <TradesTable
        trades={trades}
        onDelete={handleDeleteTrade}
        onEdit={handleEditTrade}
      />

      {/* Trade Entry Form */}
      <TradeEntryForm
        isOpen={isEntryFormOpen}
        onClose={() => setIsEntryFormOpen(false)}
        onCreate={handleCreateTrade}
      />

      {/* Trade Edit Modal */}
      <TradeEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTrade(null);
        }}
        onUpdate={handleUpdateTrade}
        trade={editingTrade}
      />
    </div>
  );
}
