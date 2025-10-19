'use client';

import { useEffect } from 'react';
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
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [event, onClose]);

  if (!event) return null;

  const icon = getCategoryIcon(event.category);
  const impactBadge = getImpactBadge(event.impact);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border-0 md:border border-gray-800 rounded-none md:rounded-xl max-w-full md:max-w-2xl w-full max-h-screen md:max-h-[90vh] overflow-y-auto">
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
        <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Overview Section */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">Overview</h3>
            <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400">Event: </span>
                <span className="text-white">{event.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Impact Level: </span>
                <span className={`font-semibold ${
                  event.impact === 'HIGH' ? 'text-red-400' :
                  event.impact === 'MEDIUM' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {event.impact}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Category: </span>
                <span className="text-white">{event.category}</span>
              </div>
              {event.frequency && (
                <div>
                  <span className="text-gray-400">Frequency: </span>
                  <span className="text-white">{event.frequency}</span>
                </div>
              )}
              {event.sourceUrl && (
                <div>
                  <span className="text-gray-400">Source: </span>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {event.source || 'Official Source'}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Impact Description */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">What to Expect</h3>
            <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-300">
              {event.impact === 'HIGH' && (
                <p>
                  This is a <strong className="text-red-400">high-impact event</strong> that typically
                  causes significant market volatility. Traders should exercise caution and consider
                  risk management strategies during this period.
                </p>
              )}
              {event.impact === 'MEDIUM' && (
                <p>
                  This is a <strong className="text-yellow-400">medium-impact event</strong> that may
                  cause moderate market movements. Stay informed and monitor price action around the
                  event time.
                </p>
              )}
              {event.impact === 'LOW' && (
                <p>
                  This is a <strong className="text-green-400">low-impact event</strong> with minimal
                  expected market effect. However, it's still worth tracking for broader market context.
                </p>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-yellow-400/80">
                <strong>Disclaimer:</strong> This information is for educational purposes only.
                Not financial advice. Past performance does not guarantee future results.
                Always conduct your own research and consider your risk tolerance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
