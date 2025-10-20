import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';
import { LargeOrdersFeed } from '@/components/large-orders/LargeOrdersFeed';
import WidgetContainer from '@/components/layout/WidgetContainer';
import OrderFlowBackground from '@/components/layout/backgrounds/OrderFlowBackground';

export default function OrdersPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 
          className="text-4xl font-bold mb-8"
          style={{ 
            color: 'var(--venom-green-primary)',
            fontFamily: 'var(--apple-font-system)',
            letterSpacing: 'var(--apple-letter-spacing)',
          }}
        >
          Large Orders Feed
        </h1>
        
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
