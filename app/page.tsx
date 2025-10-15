import DashboardGrid from '@/components/layout/DashboardGrid';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OIPriceWidget from '@/widgets/price-funding-correlation/PriceFundingWidget';

export default function Home() {
  return (
    <DashboardGrid>
      <WidgetContainer title="Price vs Funding Rate Correlation">
        <OIPriceWidget />
      </WidgetContainer>
    </DashboardGrid>
  );
}