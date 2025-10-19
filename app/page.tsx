import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';
import { PnLTrackerWidgetWithBackground } from '@/widgets/pnl-tracker/PnLTrackerWidget';
import OrderFlowBackground from '@/components/layout/backgrounds/OrderFlowBackground';
import PricesBackground from '@/components/layout/backgrounds/PricesBackground';
import AlertBackground from '@/components/layout/backgrounds/AlertBackground';
import EconomicCalendarBackground from '@/components/layout/backgrounds/EconomicCalendarBackground';
import { EconomicCalendar } from '@/components/economic-calendar/EconomicCalendar';
import { LargeOrdersFeed } from '@/components/large-orders/LargeOrdersFeed';
import { AlertSystem } from '@/components/alerts/AlertSystem';
import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import { Info } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20">
      {/* Header with UTC Clock */}
      <Header />
      
      {/* Market Hours Bar */}
      <MarketHoursBar />
      
      {/* Simplified info banner */}
      <div className="bg-blue-500/5 border-b border-blue-500/10 py-2">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-green-400 status-pulse" />
          </div>
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-gray-400 font-financial">
            Live prices • 24h charts (hourly intervals)
          </span>
        </div>
      </div>

      <DashboardGrid>
        {/* Row 1: Real-Time Prices (1 col), Economic Calendar (1 col tablet, 2 cols desktop) */}
        <div className="col-span-1">
          <WidgetContainer 
            title="Real-Time Prices"
            background={<PricesBackground />}
          >
            <div className="xl:max-h-[600px]">
              <RealTimePricesWidget />
            </div>
          </WidgetContainer>
        </div>

        <div className="col-span-1 xl:col-span-2">
          <WidgetContainer 
            title=""
            background={<EconomicCalendarBackground />}
          >
            <EconomicCalendar />
          </WidgetContainer>
        </div>

        {/* Row 2: Large Orders Feed - full width on mobile/tablet, 2 cols on XL with Alert System beside it */}
        <div className="col-span-1 md:col-span-2 xl:col-span-2">
          <WidgetContainer 
            title=""
            background={<OrderFlowBackground />}
          >
            <LargeOrdersFeed />
          </WidgetContainer>
        </div>

        {/* Alert System - full width on mobile/tablet, 1 col on XL (beside Large Orders) */}
        <div className="col-span-1 md:col-span-2 xl:col-span-1">
          <WidgetContainer 
            title=""
            background={<AlertBackground />}
          >
            <AlertSystem />
          </WidgetContainer>
        </div>

        {/* Row 3: PnL Tracker - full width on all breakpoints */}
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <PnLTrackerWidgetWithBackground />
        </div>
      </DashboardGrid>

      {/* Reduced footer disclaimer */}
      <footer className="border-t border-gray-800/50 mt-8 sm:mt-12 py-3 sm:py-4 md:py-6">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-[10px] sm:text-xs text-gray-600">
            Information platform only. Not financial advice. DYOR. Trading involves substantial risk.
          </p>
        </div>
      </footer>
    </div>
  );
}