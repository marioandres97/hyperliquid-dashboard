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

export default function Home() {
  return (
    <div className="min-h-screen">
      <DashboardGrid>
        {/* Market Overview Bar - full width */}
        <div className="md:col-span-2">
          <MarketOverview />
        </div>

        {/* Row 1: Order Flow, Real-Time Prices */}
        <WidgetContainer 
          title="Order Flow Signals"
          background={<OrderFlowBackground />}
        >
          <OrderFlowSignalsWidget />
        </WidgetContainer>

        <WidgetContainer 
          title="Real-Time Prices"
          background={<PricesBackground />}
        >
          <RealTimePricesWidget />
        </WidgetContainer>

        {/* Row 2: PnL Tracker, Market Time */}
        <PnLTrackerWidgetWithBackground />

        <WidgetContainer 
          title="Market Time"
          background={<MarketTimeBackground />}
        >
          <MarketTimeWidget />
        </WidgetContainer>

        {/* Row 3: Global Markets - full width */}
        <div className="md:col-span-2">
          <WidgetContainer 
            title="Global Markets"
            background={<GlobalMarketsBackground />}
          >
            <GlobalMarketsWidget />
          </WidgetContainer>
        </div>

        {/* Row 4: Institutional Analysis - full width */}
        <div className="md:col-span-2">
          <WidgetContainer title="" transparent>
            <InstitutionalAnalysisPortalWidget />
          </WidgetContainer>
        </div>
      </DashboardGrid>
    </div>
  );
}