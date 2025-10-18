import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';
import { PnLTrackerWidgetWithBackground } from '@/widgets/pnl-tracker/PnLTrackerWidget';
import InstitutionalAnalysisPortalWidget from '@/widgets/institutional-analysis-portal/InstitutionalAnalysisPortalWidget';
import MarketTimeWidget from '@/widgets/market-time/MarketTimeWidget';
import GlobalMarketsWidget from '@/widgets/global-markets/GlobalMarketsWidget';
import OrderFlowBackground from '@/components/layout/backgrounds/OrderFlowBackground';
import PricesBackground from '@/components/layout/backgrounds/PricesBackground';
import MarketTimeBackground from '@/components/layout/backgrounds/MarketTimeBackground';
import GlobalMarketsBackground from '@/components/layout/backgrounds/GlobalMarketsBackground';
import MarketOverview from '@/components/shared/MarketOverview';
import { EconomicCalendar } from '@/components/economic-calendar/EconomicCalendar';
import { LargeOrdersFeed } from '@/components/large-orders/LargeOrdersFeed';
import { OrderFlowAnalysis } from '@/components/order-flow/OrderFlowAnalysis';
import { AlertSystem } from '@/components/alerts/AlertSystem';

export default function Home() {
  return (
    <div className="min-h-screen">
      <DashboardGrid>
        {/* Market Overview Bar - full width */}
        <div className="md:col-span-2">
          <MarketOverview />
        </div>

        {/* Row 1: Order Flow Signals, Economic Calendar */}
        <WidgetContainer 
          title="Order Flow Signals"
          background={<OrderFlowBackground />}
        >
          <OrderFlowSignalsWidget />
        </WidgetContainer>

        <WidgetContainer 
          title=""
          background={<PricesBackground />}
        >
          <EconomicCalendar />
        </WidgetContainer>

        {/* Row 2: Real-Time Prices, Market Time */}
        <WidgetContainer 
          title="Real-Time Prices"
          background={<PricesBackground />}
        >
          <RealTimePricesWidget />
        </WidgetContainer>

        <WidgetContainer 
          title="Market Time"
          background={<MarketTimeBackground />}
        >
          <MarketTimeWidget />
        </WidgetContainer>

        {/* Row 3: Large Orders Feed - full width */}
        <div className="md:col-span-2">
          <WidgetContainer 
            title=""
            background={<OrderFlowBackground />}
          >
            <LargeOrdersFeed />
          </WidgetContainer>
        </div>

        {/* Row 4: Order Flow Analysis, Alert System */}
        <WidgetContainer 
          title=""
          background={<OrderFlowBackground />}
        >
          <OrderFlowAnalysis />
        </WidgetContainer>

        <WidgetContainer 
          title=""
          background={<PricesBackground />}
        >
          <AlertSystem />
        </WidgetContainer>

        {/* Row 5: Global Markets - full width */}
        <div className="md:col-span-2">
          <WidgetContainer 
            title="Global Markets"
            background={<GlobalMarketsBackground />}
          >
            <GlobalMarketsWidget />
          </WidgetContainer>
        </div>

        {/* Row 6: PnL Tracker - full width */}
        <div className="md:col-span-2">
          <PnLTrackerWidgetWithBackground />
        </div>

        {/* Row 7: Institutional Analysis - full width */}
        <div className="md:col-span-2">
          <WidgetContainer title="" transparent>
            <InstitutionalAnalysisPortalWidget />
          </WidgetContainer>
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