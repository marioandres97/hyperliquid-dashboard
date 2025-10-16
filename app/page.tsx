import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import PriceFundingWidget from '@/widgets/price-funding-correlation/PriceFundingWidget';
import OrderFlowWidget from '@/widgets/order-flow/OrderFlowWidget';
import OrderFlowSignalsWidget from '@/widgets/order-flow-signals/OrderFlowSignalsWidget';
import { SignalPerformanceWidget } from '@/widgets/signal-performance/SignalPerformanceWidget';

export default function Home() {
  return (
    <DashboardGrid>
      <WidgetContainer title="Price vs Funding Rate Correlation">
        <PriceFundingWidget />
      </WidgetContainer>

      <WidgetContainer title="Order Flow Analysis">
        <OrderFlowWidget />
      </WidgetContainer>

      <WidgetContainer title="Order Flow Signals">
        <OrderFlowSignalsWidget />
      </WidgetContainer>

      <WidgetContainer title="Signal Performance">
          <SignalPerformanceWidget />
        </WidgetContainer>
    </DashboardGrid>
  );
}