import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import { SignalPerformanceWidget } from '@/widgets/signal-performance/SignalPerformanceWidget';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';
import PnLTrackerWidget from '@/widgets/pnl-tracker/PnLTrackerWidget';
import InstitutionalAnalysisPortalWidget from '@/widgets/institutional-analysis-portal/InstitutionalAnalysisPortalWidget';

export default function Home() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0f1419 100%)',
      minHeight: '100vh',
    }}>
      <DashboardGrid>
        <WidgetContainer title="Order Flow Signals">
          <OrderFlowSignalsWidget />
        </WidgetContainer>

        <WidgetContainer title="Signal Performance">
          <SignalPerformanceWidget />
        </WidgetContainer>

        <WidgetContainer title="Real-Time Prices">
          <RealTimePricesWidget />
        </WidgetContainer>

        <WidgetContainer title="PnL Tracker">
          <PnLTrackerWidget />
        </WidgetContainer>

        <WidgetContainer title="">
          <InstitutionalAnalysisPortalWidget />
        </WidgetContainer>
      </DashboardGrid>
    </div>
  );
}