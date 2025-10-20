'use client';

import useSWR from 'swr';
import { ChannelBadge } from './ChannelBadge';
import { History, CheckCircle2, XCircle } from 'lucide-react';
import type { AlertHistory } from '@/types/alerts';

interface HistoryResponse {
  success: boolean;
  data: AlertHistory[];
  count: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AlertHistoryTable() {
  const { data, error, isLoading } = useSWR<HistoryResponse>(
    '/api/alerts/history',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const history = data?.data || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <History className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white">Alert History</h3>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading history...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-400">Failed to load alert history</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && history.length === 0 && (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl p-8 text-center">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No triggered alerts yet</p>
        </div>
      )}

      {/* History Table */}
      {!isLoading && !error && history.length > 0 && (
        <div className="backdrop-blur-xl bg-gray-900/30 border border-emerald-500/10 rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Triggered At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-semibold">
                        {item.asset}/{item.baseAsset}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300 text-sm">
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">
                        {item.targetValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-emerald-400 font-semibold">
                        {item.actualValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(item.triggeredAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.sentChannels.map((channel) => (
                          <div key={channel} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400">{channel}</span>
                          </div>
                        ))}
                        {item.failedChannels.map((channel) => (
                          <div key={channel} className="flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400">{channel}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-700">
            {history.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">
                    {item.asset}/{item.baseAsset}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.triggeredAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 text-white">{item.type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Target:</span>
                    <span className="ml-2 text-white">{item.targetValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Actual:</span>
                    <span className="ml-2 text-emerald-400 font-semibold">
                      {item.actualValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
                  {item.sentChannels.map((channel) => (
                    <div key={channel} className="flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">{channel}</span>
                    </div>
                  ))}
                  {item.failedChannels.map((channel) => (
                    <div key={channel} className="flex items-center gap-1 text-xs">
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
