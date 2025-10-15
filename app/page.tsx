import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import PriceFundingWidget from '@/widgets/price-funding-correlation/PriceFundingWidget';
import OrderFlowWidget from '@/widgets/order-flow/OrderFlowWidget';

export default function Home() {
  return (
    <DashboardGrid>
      <WidgetContainer title="Price vs Funding Rate Correlation">
        <PriceFundingWidget />
      </WidgetContainer>

      <WidgetContainer title="Order Flow Analysis">
        <OrderFlowWidget />
      </WidgetContainer>
    </DashboardGrid>
  );
}