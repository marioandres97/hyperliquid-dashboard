'use client';

import type { EconomicEventWithReleases } from '@/lib/economic-calendar/types';
import { getCategoryIcon, getImpactBadge } from '@/lib/economic-calendar/events-data';
import { formatEventDate } from '@/lib/economic-calendar/api';
import { X } from 'lucide-react';

interface EventModalProps {
  event: EconomicEventWithReleases | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  if (!event) return null;

  const icon = getCategoryIcon(event.category);
  const impactBadge = getImpactBadge(event.impact);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{icon}</span>
              <h2 className="text-2xl font-bold text-white">{event.name}</h2>
              <span className="text-2xl">{impactBadge}</span>
            </div>
            <div className="text-sm text-gray-400">
              {formatEventDate(event.eventDate)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Overview</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
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
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">What to Expect</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300">
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

          {/* Volatility Window */}
          {event.primaryWindowStart && event.primaryWindowEnd && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Expected Volatility Window</h3>
              <div className="space-y-2">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-xs text-yellow-400 mb-1">Primary Window</div>
                  <div className="text-white font-medium">
                    {event.primaryWindowStart} - {event.primaryWindowEnd} UTC
                  </div>
                </div>
                {event.extendedWindowStart && event.extendedWindowEnd && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Extended Window</div>
                    <div className="text-white font-medium">
                      {event.extendedWindowStart} - {event.extendedWindowEnd} UTC
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-xs text-yellow-400/80">
              ⚠️ <strong>Disclaimer:</strong> This information is for educational purposes only.
              Not financial advice. Past performance does not guarantee future results.
              Always conduct your own research and consider your risk tolerance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
