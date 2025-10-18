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

  // Generate sample historical releases for demo
  const sampleReleases = [
    {
      date: 'Jan 15, 2025',
      sentiment: 'Hawkish',
      btcImpact: -3.2,
      ethImpact: -4.1,
      spxImpact: -1.5,
    },
    {
      date: 'Dec 18, 2024',
      sentiment: 'Neutral',
      btcImpact: 0.8,
      ethImpact: 1.2,
      spxImpact: 0.3,
    },
    {
      date: 'Nov 20, 2024',
      sentiment: 'Dovish',
      btcImpact: 4.5,
      ethImpact: 5.2,
      spxImpact: 2.1,
    },
  ];

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
          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">OVERVIEW</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-400">What: </span>
                <span className="text-white">{event.name}</span>
              </div>
              {event.sourceUrl && (
                <div>
                  <span className="text-gray-400">Source: </span>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {event.source || 'Official Source'}
                  </a>
                </div>
              )}
              {event.frequency && (
                <div>
                  <span className="text-gray-400">Frequency: </span>
                  <span className="text-white">{event.frequency}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Historical Impact */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">HISTORICAL IMPACT</h3>
            <div className="grid grid-cols-2 gap-3">
              {event.btcAvgImpact !== undefined && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">BTC Average</div>
                  <div className="text-xl font-bold text-white">
                    ±{event.btcAvgImpact.toFixed(1)}%
                  </div>
                </div>
              )}
              {event.ethAvgImpact !== undefined && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">ETH Average</div>
                  <div className="text-xl font-bold text-white">
                    ±{event.ethAvgImpact.toFixed(1)}%
                  </div>
                </div>
              )}
              {event.spxAvgImpact !== undefined && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">S&P 500 Average</div>
                  <div className="text-xl font-bold text-white">
                    ±{event.spxAvgImpact.toFixed(1)}%
                  </div>
                </div>
              )}
              {event.volumeSpike !== undefined && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Volume Spike</div>
                  <div className="text-xl font-bold text-white">
                    +{event.volumeSpike}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Volatility Window */}
          {event.primaryWindowStart && event.primaryWindowEnd && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">VOLATILITY WINDOW</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">Primary</div>
                  <div className="text-white font-medium">
                    {event.primaryWindowStart} - {event.primaryWindowEnd} UTC
                  </div>
                </div>
                {event.extendedWindowStart && event.extendedWindowEnd && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-gray-400">Extended</div>
                    <div className="text-white font-medium">
                      {event.extendedWindowStart} - {event.extendedWindowEnd} UTC
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Last 3 Releases */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">LAST 3 RELEASES</h3>
            <div className="space-y-2">
              {sampleReleases.map((release, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{release.date}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        release.sentiment === 'Hawkish'
                          ? 'bg-red-500/20 text-red-400'
                          : release.sentiment === 'Dovish'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {release.sentiment}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">BTC: </span>
                      <span
                        className={
                          release.btcImpact > 0 ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {release.btcImpact > 0 ? '+' : ''}
                        {release.btcImpact.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">ETH: </span>
                      <span
                        className={
                          release.ethImpact > 0 ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {release.ethImpact > 0 ? '+' : ''}
                        {release.ethImpact.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">SPX: </span>
                      <span
                        className={
                          release.spxImpact > 0 ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {release.spxImpact > 0 ? '+' : ''}
                        {release.spxImpact.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-xs text-yellow-400/80">
              ⚠️ Historical data. Not financial advice. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
