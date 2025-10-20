import { AlertSystem } from '@/components/alerts/AlertSystem';
import WidgetContainer from '@/components/layout/WidgetContainer';
import AlertBackground from '@/components/layout/backgrounds/AlertBackground';
import Header from '@/components/Header';
import MarketHoursBar from '@/components/MarketHoursBar';

export default function AlertsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <MarketHoursBar />
      
      <div className="container mx-auto px-4 py-8">
        <WidgetContainer 
          title=""
          background={<AlertBackground />}
        >
          <AlertSystem />
        </WidgetContainer>
      </div>
    </div>
  );
}
