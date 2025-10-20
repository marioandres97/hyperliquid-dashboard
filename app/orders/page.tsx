import { LargeOrdersFeed } from '@/components/large-orders/LargeOrdersFeed';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowBackground from '@/components/layout/backgrounds/OrderFlowBackground';
import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';

export default function OrdersPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-4 py-8">
        <WidgetContainer 
          title=""
          background={<OrderFlowBackground />}
        >
          <LargeOrdersFeed />
        </WidgetContainer>
      </div>
    </div>
  );
}
