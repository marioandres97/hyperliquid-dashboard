'use client';

import { useState, useEffect } from 'react';
import { Globe, Clock } from 'lucide-react';
import { Market, getMarketStatus, formatTime, formatCountdown } from '@/lib/utils/marketHours';

const MARKETS: Market[] = [
  { name: 'Tokyo', openHour: 0, openMinute: 0, closeHour: 6, closeMinute: 0, region: 'Asia' },
  { name: 'London', openHour: 8, openMinute: 0, closeHour: 16, closeMinute: 30, region: 'Europe' },
  { name: 'NYSE', openHour: 14, openMinute: 30, closeHour: 21, closeMinute: 0, region: 'Americas' },
  { name: 'Wall Street', openHour: 14, openMinute: 30, closeHour: 21, closeMinute: 0, region: 'Americas' },
  { name: 'CME Chicago', openHour: 17, openMinute: 0, closeHour: 16, closeMinute: 0, region: 'Americas' },
];

export default function GlobalMarketsWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const marketStatuses = MARKETS.map(market => ({
    ...market,
    ...getMarketStatus(market, now)
  }));

  // Find next market to open
  const closedMarkets = marketStatuses.filter(m => !m.isOpen);
  const nextToOpen = closedMarkets.sort((a, b) => a.minutesToNext - b.minutesToNext)[0];

  return (
    <div className="h-full flex flex-col space-y-3 p-1">
      {/* Header with Globe */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400 animate-pulse" />
          <span className="text-sm font-medium text-white">Global Markets</span>
        </div>
        {nextToOpen && !nextToOpen.isOpen && (
          <div className="text-xs text-yellow-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Next: {nextToOpen.name}
          </div>
        )}
      </div>

      {/* World map background indicator */}
      <div className="relative h-24 bg-gradient-to-r from-blue-600/10 via-green-600/10 to-blue-600/10 rounded-xl border border-blue-400/20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <circle cx="20" cy="25" r="2" fill="#3B82F6" className="animate-pulse" />
            <circle cx="45" cy="20" r="2" fill="#10B981" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="75" cy="25" r="2" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '1s' }} />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-white/60 text-center">
            <div className="font-semibold text-white/80">24/7 Market Coverage</div>
            <div className="text-[10px]">Tracking major global exchanges</div>
          </div>
        </div>
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {marketStatuses.map((market) => {
          const isOpening = !market.isOpen && market.minutesToNext <= 60;
          const statusColor = market.isOpen ? 'green' : isOpening ? 'yellow' : 'red';
          const statusEmoji = market.isOpen ? '🟢' : isOpening ? '🟡' : '🔴';

          return (
            <div
              key={market.name}
              className={`bg-white/5 backdrop-blur-sm rounded-xl p-3 border transition-all duration-300 ${
                market.isOpen
                  ? 'border-green-400/40 bg-green-500/5'
                  : isOpening
                  ? 'border-yellow-400/40 bg-yellow-500/5'
                  : 'border-white/10'
              } ${market.name === nextToOpen?.name && !market.isOpen ? 'ring-2 ring-yellow-400/30' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{statusEmoji}</span>
                  <div>
                    <div className="font-semibold text-white">{market.name}</div>
                    <div className="text-xs text-white/50">{market.region}</div>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  market.isOpen
                    ? 'bg-green-400/20 text-green-300'
                    : isOpening
                    ? 'bg-yellow-400/20 text-yellow-300'
                    : 'bg-red-400/20 text-red-300'
                }`}>
                  {market.status}
                </div>
              </div>

              {/* Trading Hours */}
              <div className="text-xs text-white/60 mb-2">
                Trading: {formatTime(market.openHour * 60 + market.openMinute)} - {formatTime(market.closeHour * 60 + market.closeMinute)} UTC
              </div>

              {/* Countdown */}
              <div className="text-sm font-medium text-white/80">
                {market.isOpen ? (
                  <>Closes in: <span className="text-green-400">{formatCountdown(market.minutesToNext)}</span></>
                ) : market.status === 'CLOSED' && market.reason === 'Weekend' ? (
                  <span className="text-red-400">Weekend - Markets Closed</span>
                ) : (
                  <>Opens in: <span className={isOpening ? 'text-yellow-400' : 'text-white/70'}>{formatCountdown(market.minutesToNext)}</span></>
                )}
              </div>

              {/* Progress Bar (only for open markets) */}
              {market.isOpen && (
                <div className="mt-2">
                  <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-green-400 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${market.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/50 mt-1 text-right">
                    {market.progress.toFixed(0)}% complete
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
