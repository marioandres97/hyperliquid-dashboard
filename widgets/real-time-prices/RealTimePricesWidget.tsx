'use client';

import { useState, useEffect, useRef } from 'react';
import { usePrices } from './usePrices';
import { PremiumPriceCard } from '@/components/shared/PremiumPriceCard';
import { MobileCarousel } from '@/components/shared/MobileCarousel';

const COINS = ['BTC', 'ETH', 'HYPE'];
const SPARKLINE_LENGTH = 20; // Keep last 20 prices for sparkline

export default function RealTimePricesWidget() {
  const { prices, isConnected } = usePrices();
  const [isMobile, setIsMobile] = useState(false);
  
  // Store price history for sparklines - using state to trigger re-renders
  const [sparklineData, setSparklineData] = useState<Record<string, number[]>>({
    BTC: [],
    ETH: [],
    HYPE: [],
  });

  // Track price updates for sparklines
  useEffect(() => {
    const hasUpdates = COINS.some(coin => prices[coin] && sparklineData[coin]);
    
    if (hasUpdates) {
      setSparklineData(prev => {
        const updated = { ...prev };
        
        COINS.forEach(coin => {
          if (prices[coin]) {
            const currentData = prev[coin] || [];
            const newData = [...currentData, prices[coin].price];
            
            // Keep only last SPARKLINE_LENGTH prices
            if (newData.length > SPARKLINE_LENGTH) {
              newData.shift();
            }
            
            updated[coin] = newData;
          }
        });
        
        return updated;
      });
    }
  }, [prices]);

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
      <div className="h-full min-h-[400px]">
        <MobileCarousel>
          {COINS.map(coin => (
            <PremiumPriceCard
              key={coin}
              coin={coin}
              data={prices[coin]}
              isConnected={isConnected[coin]}
              sparklineData={sparklineData[coin]}
            />
          ))}
        </MobileCarousel>
      </div>
    );
  }

  // Desktop/Tablet: 3-card grid
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {COINS.map(coin => (
        <PremiumPriceCard
          key={coin}
          coin={coin}
          data={prices[coin]}
          isConnected={isConnected[coin]}
          sparklineData={sparklineData[coin]}
        />
      ))}
    </div>
  );
}
