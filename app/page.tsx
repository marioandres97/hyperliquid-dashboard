import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import { SignalPerformanceWidget } from '@/widgets/signal-performance/SignalPerformanceWidget';
import RealTimePricesWidget from '@/widgets/real-time-prices/RealTimePricesWidget';
import PnLTrackerWidget from '@/widgets/pnl-tracker/PnLTrackerWidget';

export default function Home() {
  return (
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
    </DashboardGrid>
  );
}