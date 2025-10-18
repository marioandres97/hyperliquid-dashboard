import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import { SignalPerformanceWidget } from '@/widgets/signal-performance/SignalPerformanceWidget';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';
import PnLTrackerWidget from '@/widgets/pnl-tracker/PnLTrackerWidget';
import InstitutionalAnalysisPortalWidget from '@/widgets/institutional-analysis-portal/InstitutionalAnalysisPortalWidget';
import OrderFlowBackground from '@/components/layout/backgrounds/OrderFlowBackground';
import SignalPerformanceBackground from '@/components/layout/backgrounds/SignalPerformanceBackground';
import PricesBackground from '@/components/layout/backgrounds/PricesBackground';
import PnLBackground from '@/components/layout/backgrounds/PnLBackground';

export default function Home() {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, var(--color-bg-dark-start) 0%, var(--color-bg-dark-mid) 50%, var(--color-bg-dark-end) 100%)',
    }}>
      <DashboardGrid>
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

        <WidgetContainer 
          title="PnL Tracker"
          background={<PnLBackground isPositive={true} />}
        >
          <PnLTrackerWidget />
        </WidgetContainer>

        <WidgetContainer title="">
          <InstitutionalAnalysisPortalWidget />
        </WidgetContainer>
      </DashboardGrid>
    </div>
  );
}