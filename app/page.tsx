import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import { SignalPerformanceWidget } from '@/widgets/signal-performance/SignalPerformanceWidget';

export default function Home() {
  return (
    <DashboardGrid>
      <WidgetContainer title="Order Flow Signals">
        <OrderFlowSignalsWidget />
      </WidgetContainer>

      <WidgetContainer title="Signal Performance">
          <SignalPerformanceWidget />
        </WidgetContainer>
    </DashboardGrid>
  );
}