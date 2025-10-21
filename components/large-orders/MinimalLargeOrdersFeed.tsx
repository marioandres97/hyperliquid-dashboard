'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWhaleTrades } from '@/hooks/useWhaleTrades';
import type { WhaleTrade } from '@/hooks/useWhaleTrades';

// Helper functions
function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMs = now - time;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

type CoinFilter = 'ALL' | 'BTC' | 'ETH';
type TimeframeFilter = '1H' | '24H' | '7D';

export function MinimalLargeOrdersFeed() {
  const [selectedCoin, setSelectedCoin] = useState<CoinFilter>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeFilter>('24H');
  
  // Calculate hours based on timeframe
  const hours = selectedTimeframe === '1H' ? 1 : selectedTimeframe === '24H' ? 24 : 168;
  
  // Fetch trades with filters
  const { trades, loading, error, refetch } = useWhaleTrades({
    asset: selectedCoin === 'ALL' ? undefined : selectedCoin,
    hours,
    limit: 20,
  });

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Calculate stats
  const totalVolume = trades.reduce((sum, trade) => sum + trade.notionalValue, 0);
  const totalTrades = trades.length;
  const biggestTrade = trades.length > 0 
    ? trades.reduce((max, trade) => trade.notionalValue > max.notionalValue ? trade : max, trades[0])
    : null;
  const latestTrade = trades.length > 0 ? trades[0] : null;

  return (
    <div className="min-h-screen" style={{ 
      background: '#FAFAFA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#1D1D1F',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}>
            Institutional Flow
          </h1>
          <p style={{
            fontSize: '19px',
            fontWeight: '400',
            color: '#86868B',
            letterSpacing: '0.01em',
          }}>
            Tracking significant BTC and ETH trades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Volume Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '400', color: '#86868B', marginBottom: '8px' }}>
              Total Volume (24h)
            </div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#1D1D1F' }}>
              {formatUSD(totalVolume)}
            </div>
          </div>

          {/* Total Trades Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '400', color: '#86868B', marginBottom: '8px' }}>
              Total Trades (24h)
            </div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#1D1D1F' }}>
              {totalTrades}
            </div>
          </div>

          {/* Biggest Trade Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '400', color: '#86868B', marginBottom: '8px' }}>
              Biggest Trade (24h)
            </div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#1D1D1F' }}>
              {biggestTrade ? formatUSD(biggestTrade.notionalValue) : '$0'}
            </div>
            {biggestTrade && (
              <div style={{
                marginTop: '4px',
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '8px',
                background: '#F5F5F7',
                fontSize: '11px',
                fontWeight: '500',
                color: '#1D1D1F',
              }}>
                {biggestTrade.asset}
              </div>
            )}
          </div>

          {/* Latest Trade Card */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '400', color: '#86868B', marginBottom: '8px' }}>
              Latest Trade
            </div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#1D1D1F' }}>
              {latestTrade ? formatRelativeTime(latestTrade.timestamp) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Coin Filter */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['ALL', 'BTC', 'ETH'] as CoinFilter[]).map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: selectedCoin === coin ? '#F5F5F7' : 'transparent',
                    color: '#1D1D1F',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCoin !== coin) {
                      e.currentTarget.style.background = '#F5F5F7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCoin !== coin) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {coin}
                </button>
              ))}
            </div>

            {/* Separator */}
            <div style={{ 
              width: '1px', 
              height: '24px', 
              background: '#D2D2D7',
            }} />

            {/* Timeframe Filter */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['1H', '24H', '7D'] as TimeframeFilter[]).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    border: 'none',
                    background: selectedTimeframe === timeframe ? '#F5F5F7' : 'transparent',
                    color: '#1D1D1F',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTimeframe !== timeframe) {
                      e.currentTarget.style.background = '#F5F5F7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTimeframe !== timeframe) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trades Feed */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {loading && trades.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid #F5F5F7',
                borderTop: '3px solid #1D1D1F',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#86868B',
            }}>
              <p>Failed to load trades. Please try again.</p>
            </div>
          ) : trades.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#1D1D1F',
                marginBottom: '8px',
              }}>
                No large orders yet
              </div>
              <div style={{ 
                fontSize: '17px', 
                color: '#86868B',
              }}>
                Check back soon for institutional activity
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trades.map((trade, index) => (
                <div
                  key={trade.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Left: Coin Badge */}
                  <div style={{
                    minWidth: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: '#F5F5F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1D1D1F',
                  }}>
                    {trade.asset}
                  </div>

                  {/* Center: Trade Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '22px', 
                      fontWeight: '600', 
                      color: '#1D1D1F',
                      marginBottom: '4px',
                    }}>
                      {formatUSD(trade.notionalValue)}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#86868B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span>{formatRelativeTime(trade.timestamp)}</span>
                      <span style={{ 
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: '#F5F5F7',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}>
                        {trade.category}
                      </span>
                    </div>
                  </div>

                  {/* Right: Side Badge */}
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: trade.side === 'BUY' ? '#34C759' : '#FF3B30',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    minWidth: '70px',
                    textAlign: 'center',
                  }}>
                    {trade.side}
                  </div>
                </div>
              ))}
              <style>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
