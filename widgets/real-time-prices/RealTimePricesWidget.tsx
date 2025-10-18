'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePrices } from './usePrices';
import { useTrades } from '@/lib/hyperliquid/hooks/useTrades';
import { calculateCVD, getCVDTrend, formatCVDTime, CVDDataPoint } from '@/lib/utils/cvd';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COINS = ['BTC', 'ETH', 'HYPE'];

// Hook to collect trades for CVD calculation for multiple coins
function useMultiCoinTrades() {
  const [trades, setTrades] = useState<Record<string, { timestamp: number; side: 'BUY' | 'SELL'; size: number; price: number }[]>>({});
  
  useEffect(() => {
    const tradeBuffers: Record<string, any[]> = {
      BTC: [],
      ETH: [],
      HYPE: []
    };
    
    const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
    
    ws.onopen = () => {
      // Subscribe to trades for all coins
      COINS.forEach(coin => {
        ws.send(JSON.stringify({
          method: 'subscribe',
          subscription: { type: 'trades', coin }
        }));
      });
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.channel === 'trades' && data.data) {
          const coin = data.data[0]?.coin;
          if (!coin || !COINS.includes(coin)) return;
          
          const newTrades = data.data.map((t: any) => ({
            timestamp: t.time,
            side: t.side === 'B' ? 'BUY' as const : 'SELL' as const,
            size: parseFloat(t.sz),
            price: parseFloat(t.px)
          }));
          
          // Add to buffer
          tradeBuffers[coin].push(...newTrades);
          
          // Keep only last 24h + buffer (25h)
          const cutoff = Date.now() - (25 * 60 * 60 * 1000);
          tradeBuffers[coin] = tradeBuffers[coin].filter(t => t.timestamp >= cutoff);
          
          // Update state periodically (every 10 seconds)
          setTrades(prev => ({
            ...prev,
            [coin]: [...tradeBuffers[coin]]
          }));
        }
      } catch (error) {
        console.error('Error processing trades:', error);
      }
    };
    
    // Update trades state every 10 seconds
    const updateInterval = setInterval(() => {
      setTrades({ ...tradeBuffers });
    }, 10000);
    
    return () => {
      clearInterval(updateInterval);
      ws.close();
    };
  }, []);
  
  return trades;
}

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();
  const coinTrades = useMultiCoinTrades();

  // Calculate CVD data for each coin
  const cvdDataByCoins = useMemo(() => {
    const result: Record<string, CVDDataPoint[]> = {};
    
    COINS.forEach(coin => {
      const trades = coinTrades[coin] || [];
      if (trades.length > 0) {
        result[coin] = calculateCVD(trades, 24);
      } else {
        result[coin] = [];
      }
    });
    
    return result;
  }, [coinTrades]);

  return (
    <div className="h-full flex flex-col space-y-3">
      {COINS.map(coin => {
        const data = prices[coin];
        const connected = isConnected[coin];
        const isPositive = data?.change24h >= 0;
        const cvdData = cvdDataByCoins[coin] || [];
        const cvdTrend = getCVDTrend(cvdData);
        const isCVDBullish = cvdTrend >= 0;

        return (
          <div
            key={coin}
            className="flex-1 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-white/60" />
                <span className="text-lg font-bold text-white">{coin}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>

            {data ? (
              <>
                <div className="text-3xl font-bold text-white mb-2">
                  ${data.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{data.change24h.toFixed(2)}%
                  </span>
                  <span className="text-xs text-white/50">24h</span>
                </div>

                {/* CVD Chart - replaces fake price action chart */}
                {cvdData.length > 0 ? (
                  <div className="mb-3">
                    <div className="text-xs text-white/50 mb-1.5">
                      CVD (24h) - {isCVDBullish ? 'Bullish' : 'Bearish'}
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={cvdData}>
                        <XAxis 
                          dataKey="time" 
                          tickFormatter={formatCVDTime}
                          stroke="#ffffff40"
                          tick={{ fill: '#ffffff60', fontSize: 10 }}
                          tickCount={6}
                        />
                        <YAxis 
                          stroke="#ffffff40"
                          tick={{ fill: '#ffffff60', fontSize: 10 }}
                          width={60}
                          tickFormatter={(val) => {
                            if (Math.abs(val) >= 1000000) {
                              return `${(val / 1000000).toFixed(1)}M`;
                            } else if (Math.abs(val) >= 1000) {
                              return `${(val / 1000).toFixed(1)}K`;
                            }
                            return val.toFixed(0);
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #ffffff20',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          labelFormatter={formatCVDTime}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'CVD']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cvd" 
                          stroke={isCVDBullish ? '#10B981' : '#EF4444'}
                          strokeWidth={2}
                          dot={false}
                          fill={isCVDBullish ? '#10B98120' : '#EF444420'}
                          fillOpacity={0.3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="mb-3 h-[120px] flex items-center justify-center">
                    <div className="text-xs text-white/40">Loading CVD data...</div>
                  </div>
                )}

                {/* Additional Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-white/50 mb-0.5">24h High</div>
                    <div className="text-sm font-semibold text-green-400 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      ${(data.price * (1 + Math.abs(data.change24h) / 100)).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-white/50 mb-0.5">24h Low</div>
                    <div className="text-sm font-semibold text-red-400 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" />
                      ${(data.price * (1 - Math.abs(data.change24h) / 100)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-white/60">Connecting...</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
