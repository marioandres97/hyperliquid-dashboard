'use client';

import React from 'react';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface MacroEvent {
  date: string;
  time: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export const MacroEventsCalendar: React.FC = () => {
  const events: MacroEvent[] = [
    {
      date: 'Oct 20',
      time: '14:00 UTC',
      event: 'Fed Meeting Minutes',
      impact: 'HIGH',
      description: 'Federal Reserve meeting minutes release - expect high volatility',
    },
    {
      date: 'Oct 22',
      time: '12:30 UTC',
      event: 'US CPI Data',
      impact: 'HIGH',
      description: 'Consumer Price Index report - major market mover',
    },
    {
      date: 'Oct 25',
      time: '13:00 UTC',
      event: 'PMI Flash Estimates',
      impact: 'MEDIUM',
      description: 'Purchasing Managers Index preliminary data',
    },
    {
      date: 'Oct 27',
      time: '12:30 UTC',
      event: 'GDP Growth Rate',
      impact: 'HIGH',
      description: 'Q3 GDP preliminary estimate',
    },
    {
      date: 'Oct 30',
      time: '14:00 UTC',
      event: 'Employment Data',
      impact: 'MEDIUM',
      description: 'Non-farm payrolls and unemployment rate',
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return { bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', text: 'text-red-400' };
      case 'MEDIUM': return { bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', text: 'text-yellow-400' };
      case 'LOW': return { bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', text: 'text-green-400' };
      default: return { bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', text: 'text-blue-400' };
    }
  };

  return (
    <div className="space-y-3">
      {events.map((event, idx) => {
        const colors = getImpactColor(event.impact);
        return (
          <div
            key={idx}
            className="p-4 rounded-lg"
            style={{ background: colors.bg, border: colors.border }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Date</div>
                  <div className="font-bold text-white">{event.date}</div>
                  <div className="text-xs text-gray-400">{event.time}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-blue-400" />
                    <span className="font-bold text-white">{event.event}</span>
                  </div>
                  <div className="text-sm text-gray-300">{event.description}</div>
                </div>
              </div>
              <div className="ml-4">
                <span className={`px-3 py-1 rounded text-xs font-bold ${colors.text} bg-black/30`}>
                  {event.impact} IMPACT
                </span>
              </div>
            </div>
            {event.impact === 'HIGH' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={14} />
                <span>Large trades often occur 1-2 hours before major announcements</span>
              </div>
            )}
          </div>
        );
      })}
      
      <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/30 text-sm text-blue-300">
        <strong>Strategy Tip:</strong> Monitor for unusual volume or position changes 2-4 hours before HIGH impact events - institutional traders often position ahead of announcements
      </div>
    </div>
  );
};
