'use client';

import { useState, useEffect, useRef } from 'react';
import { usePrices } from './usePrices';
import { PremiumPriceCard } from '@/components/shared/PremiumPriceCard';
import { MobileCarousel } from '@/components/shared/MobileCarousel';

const COINS = ['BTC', 'ETH', 'HYPE'];
const UPDATE_INTERVAL = 60 * 60 * 1000; // Update every hour

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();
  const [isMobile, setIsMobile] = useState(false);
  
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

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: Carousel view
  if (isMobile) {
    return (
      <div className="h-full min-h-[400px] flex flex-col">
        <div className="flex-1">
          <MobileCarousel>
            {COINS.map(coin => (
              <PremiumPriceCard
                key={coin}
                coin={coin}
                data={prices[coin]}
                isConnected={isConnected[coin]}
                sparklineData={sparklineData[coin] || []}
              />
            ))}
          </MobileCarousel>
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400/60 font-medium">
            Prices from Hyperliquid exchange • Updates hourly
          </p>
        </div>
      </div>
    );
  }

  // Desktop/Tablet: 3-card grid
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
          Prices from Hyperliquid exchange • Updates hourly
        </p>
      </div>
    </div>
  );
}
