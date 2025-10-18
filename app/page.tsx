import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import { SignalPerformanceWidget } from '@/widgets/signal-performance/SignalPerformanceWidget';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';
import { PnLTrackerWidgetWithBackground } from '@/widgets/pnl-tracker/PnLTrackerWidget';
import InstitutionalAnalysisPortalWidget from '@/widgets/institutional-analysis-portal/InstitutionalAnalysisPortalWidget';
import MarketTimeWidget from '@/widgets/market-time/MarketTimeWidget';
import GlobalMarketsWidget from '@/widgets/global-markets/GlobalMarketsWidget';
import OrderFlowBackground from '@/components/layout/backgrounds/OrderFlowBackground';
import SignalPerformanceBackground from '@/components/layout/backgrounds/SignalPerformanceBackground';
import PricesBackground from '@/components/layout/backgrounds/PricesBackground';
import MarketTimeBackground from '@/components/layout/backgrounds/MarketTimeBackground';
import GlobalMarketsBackground from '@/components/layout/backgrounds/GlobalMarketsBackground';

export default function Home() {
  return (
    <div className="min-h-screen">
      <DashboardGrid>
        {/* Row 1: Order Flow, Signal Performance, Real-Time Prices */}
        <WidgetContainer 
          title="Order Flow Signals"
          background={<OrderFlowBackground />}
        >
          <OrderFlowSignalsWidget />
        </WidgetContainer>

        <WidgetContainer 
          title="Signal Performance"
          background={<SignalPerformanceBackground />}
        >
          <SignalPerformanceWidget />
        </WidgetContainer>

        <WidgetContainer 
          title="Real-Time Prices"
          background={<PricesBackground />}
        >
          <RealTimePricesWidget />
        </WidgetContainer>

        {/* Row 2: PnL Tracker, Market Time, Global Markets */}
        <PnLTrackerWidgetWithBackground />

        <WidgetContainer 
          title="Market Time"
          background={<MarketTimeBackground />}
        >
          <MarketTimeWidget />
        </WidgetContainer>

        <WidgetContainer 
          title="Global Markets"
          background={<GlobalMarketsBackground />}
        >
          <GlobalMarketsWidget />
        </WidgetContainer>

        {/* Row 3: Institutional Analysis - full width */}
        <div className="md:col-span-2 xl:col-span-3">
          <WidgetContainer title="" transparent>
            <InstitutionalAnalysisPortalWidget />
          </WidgetContainer>
        </div>
      </DashboardGrid>
    </div>
  );
}