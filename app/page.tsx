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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20">
      {/* Header with UTC Clock */}
      <Header />
      
      {/* Market Hours Bar */}
      <MarketHoursBar />
      
      {/* Live indicator banner */}
      <div className="bg-blue-500/10 border-b border-blue-500/20 py-2">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-blue-300">
            ℹ️ Live prices • 1H charts (24h rolling window)
          </span>
        </div>
      </div>

      <DashboardGrid>
        {/* Row 1: Real-Time Prices, Economic Calendar */}
        <WidgetContainer 
          title="Real-Time Prices"
          background={<PricesBackground />}
        >
          <RealTimePricesWidget />
        </WidgetContainer>

        <div className="md:col-span-2">
          <WidgetContainer 
            title=""
            background={<EconomicCalendarBackground />}
          >
            <EconomicCalendar />
          </WidgetContainer>
        </div>

        {/* Row 2: Large Orders Feed - full width */}
        <div className="md:col-span-3">
          <WidgetContainer 
            title=""
            background={<OrderFlowBackground />}
          >
            <LargeOrdersFeed />
          </WidgetContainer>
        </div>

        {/* Row 3: Alert System, PnL Tracker */}
        <div className="lg:col-span-1">
          <WidgetContainer 
            title=""
            background={<AlertBackground />}
          >
            <AlertSystem />
          </WidgetContainer>
        </div>

        <div className="lg:col-span-2">
          <PnLTrackerWidgetWithBackground />
        </div>
      </DashboardGrid>

      {/* Footer Disclaimer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ This is an information platform. Not financial advice. Do your own research.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Historical data does not guarantee future results. Trading cryptocurrency involves substantial risk.
          </p>
        </div>
      </footer>
    </div>
  );
}