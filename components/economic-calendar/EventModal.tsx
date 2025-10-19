'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { getCategoryIcon, getImpactBadge } from '@/lib/economic-calendar/events-data';
import { formatEventDate } from '@/lib/economic-calendar/api';
import { X, AlertTriangle } from 'lucide-react';

interface EventModalProps {
  event: EconomicEventWithReleases | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  // Add escape key handler and cleanup
  useEffect(() => {
    if (!event) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll when modal is open (store original value)
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [event, onClose]);

  const icon = event ? getCategoryIcon(event.category) : null;
  const impactBadge = event ? getImpactBadge(event.impact) : null;

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop - SEPARATE element, covers full screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal Content - SEPARATE element, floats above */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc(100%-2rem)] md:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 border-0 md:border border-gray-800 rounded-none md:rounded-xl shadow-2xl z-50"
          >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 sm:p-5 md:p-6 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <span className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">{icon}</span>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white line-clamp-2">{event.name}</h2>
              <span className="text-xl sm:text-2xl flex-shrink-0">{impactBadge}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              {formatEventDate(event.eventDate)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Description Section */}
          {event.description && (
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-white">What It Is</h3>
              <div className="bg-gray-800/50 rounded-lg p-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                {event.description}
              </div>
            </div>
          )}

          {/* Economic Data Metrics */}
          {(event.btcAvgImpact || event.ethAvgImpact || event.volumeSpike) && (
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-white">Historical Market Impact</h3>
              <div className="grid grid-cols-3 gap-2">
                {event.btcAvgImpact && (
                  <div className="bg-gray-800/50 rounded-lg p-2.5 sm:p-3">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-1">BTC Avg Move</div>
                    <div className="text-sm sm:text-base font-bold text-orange-400">±{event.btcAvgImpact}%</div>
                  </div>
                )}
                {event.ethAvgImpact && (
                  <div className="bg-gray-800/50 rounded-lg p-2.5 sm:p-3">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-1">ETH Avg Move</div>
                    <div className="text-sm sm:text-base font-bold text-blue-400">±{event.ethAvgImpact}%</div>
                  </div>
                )}
                {event.volumeSpike && (
                  <div className="bg-gray-800/50 rounded-lg p-2.5 sm:p-3">
                    <div className="text-[10px] sm:text-xs text-gray-400 mb-1">Volume Spike</div>
                    <div className="text-sm sm:text-base font-bold text-green-400">+{event.volumeSpike}%</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crypto Impact */}
          {event.cryptoImpact && (
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-white">Crypto Market Impact</h3>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs sm:text-sm text-blue-200 leading-relaxed">
                {event.cryptoImpact}
              </div>
            </div>
          )}

          {/* Overview Section - Compact */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-semibold text-white">Details</h3>
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Impact Level:</span>
                <span className={`font-semibold ${
                  event.impact === 'HIGH' ? 'text-red-400' :
                  event.impact === 'MEDIUM' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {event.impact}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white">{event.category.replace('_', ' ')}</span>
              </div>
              {event.frequency && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency:</span>
                  <span className="text-white">{event.frequency}</span>
                </div>
              )}
              {event.sourceUrl && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Source:</span>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline text-right"
                  >
                    {event.source || 'Official'}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-yellow-400/80">
                <strong>Disclaimer:</strong> Historical data for educational purposes only.
                Not financial advice. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
