'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { useTrades } from '@/lib/hyperliquid/hooks';

interface TimelineEvent {
  id: string;
  traderId: string;
  timestamp: Date;
  action: 'OPENED' | 'CLOSED' | 'INCREASED' | 'DECREASED';
  direction: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  pnlPercent?: number;
  duration?: string;
}

export const TraderTimeline: React.FC = () => {
  const { trades } = useTrades(100);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Generate timeline events from trades
    const generateEvents = () => {
      const newEvents: TimelineEvent[] = [];
      
      // Track trader positions
      const traderPositions = new Map<string, { entry: number; size: number; timestamp: Date }>();
      
      trades.slice(0, 20).forEach((trade, idx) => {
        const traderId = `Trader-${(idx % 10 + 1).toString().padStart(3, '0')}`;
        const existing = traderPositions.get(traderId);
        
        if (!existing && trade.isLarge) {
          // New position
          traderPositions.set(traderId, { 
            entry: trade.price, 
            size: trade.size, 
            timestamp: trade.timestamp 
          });
          
          newEvents.push({
            id: `event-${idx}`,
            traderId,
            timestamp: trade.timestamp,
            action: 'OPENED',
            direction: trade.side === 'BUY' ? 'LONG' : 'SHORT',
            size: trade.size,
            entryPrice: trade.price,
          });
        } else if (existing && Math.random() > 0.7) {
          // Close position
          const pnl = (trade.side === 'BUY' ? -1 : 1) * (trade.price - existing.entry) * existing.size;
          const pnlPercent = ((trade.price - existing.entry) / existing.entry) * 100 * (trade.side === 'BUY' ? -1 : 1);
          const duration = Math.floor((trade.timestamp.getTime() - existing.timestamp.getTime()) / (1000 * 60 * 60));
          
          newEvents.push({
            id: `event-${idx}`,
            traderId,
            timestamp: trade.timestamp,
            action: 'CLOSED',
            direction: trade.side === 'BUY' ? 'SHORT' : 'LONG',
            size: existing.size,
            entryPrice: existing.entry,
            exitPrice: trade.price,
            pnl,
            pnlPercent,
            duration: `${duration}h`,
          });
          
          traderPositions.delete(traderId);
        }
      });
      
      setEvents(newEvents.slice(0, 10));
    };

    generateEvents();
  }, [trades]);

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 rounded-lg border-l-4"
          style={{ 
            background: event.action === 'CLOSED' 
              ? event.pnl && event.pnl > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              : 'rgba(59, 130, 246, 0.1)', 
            borderLeftColor: event.action === 'CLOSED'
              ? event.pnl && event.pnl > 0 ? '#10B981' : '#EF4444'
              : '#3B82F6',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-purple-400">{event.traderId}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className={`font-bold text-sm ${event.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                  {event.action} {event.direction}
                </span>
                {event.action === 'OPENED' ? (
                  <TrendingUp size={14} className={event.direction === 'LONG' ? 'text-green-400' : 'text-red-400'} />
                ) : (
                  <TrendingDown size={14} className={event.pnl && event.pnl > 0 ? 'text-green-400' : 'text-red-400'} />
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">Size</div>
                  <div className="font-mono text-white">{event.size.toFixed(4)} BTC</div>
                </div>
                <div>
                  <div className="text-gray-400">Entry</div>
                  <div className="font-mono text-white">${event.entryPrice.toFixed(0)}</div>
                </div>
                {event.exitPrice && (
                  <div>
                    <div className="text-gray-400">Exit</div>
                    <div className="font-mono text-white">${event.exitPrice.toFixed(0)}</div>
                  </div>
                )}
                {event.pnl !== undefined && (
                  <div>
                    <div className="text-gray-400">PnL</div>
                    <div className={`font-bold ${event.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {event.pnl >= 0 ? '+' : ''}{event.pnlPercent?.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {event.timestamp.toLocaleTimeString()}
                </div>
                {event.duration && (
                  <span>Duration: {event.duration}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {events.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Waiting for trader activity...
        </div>
      )}
    </div>
  );
};
