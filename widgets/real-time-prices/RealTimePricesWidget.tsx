'use client';

import { useState, useEffect } from 'react';
import { usePrices } from './usePrices';
import { PremiumPriceCard } from '@/components/shared/PremiumPriceCard';

const COINS = ['BTC', 'ETH', 'HYPE'];
const UPDATE_INTERVAL = 60 * 60 * 1000; // Update every hour

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();
  
  // Store 24-hour historical data for sparklines (hourly updates)
  const [sparklineData, setSparklineData] = useState<Record<string, number[]>>({
    BTC: [],
    ETH: [],
    HYPE: [],
  });

  // Fetch historical data on mount and every hour
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(`/api/historical-prices?coins=${COINS.join(',')}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setSparklineData(result.data);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    // Fetch immediately
    fetchHistoricalData();

    // Set up interval to fetch every hour
    const interval = setInterval(fetchHistoricalData, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // REDESIGNED LAYOUT - Responsive grid that prevents truncation
  // Mobile (<768px): Vertical stack, full width cards
  // Tablet (768-1023px): 2 cards per row
  // Desktop (≥1024px): 3 cards in horizontal row
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {COINS.map(coin => (
          <PremiumPriceCard
            key={coin}
            coin={coin}
            data={prices[coin]}
            isConnected={isConnected[coin]}
            sparklineData={sparklineData[coin] || []}
          />
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400/60 font-medium">
          Prices from Hyperliquid exchange
        </p>
      </div>
    </div>
  );
}
